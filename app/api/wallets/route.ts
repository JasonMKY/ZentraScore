import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCachedScores } from "@/lib/cache";
import { computeAndPersistScore } from "@/lib/scoring/persist";
import { PLAN_LIMITS, type SubscriptionPlan } from "@/types";
import { syncUserPlanFromStripe } from "@/lib/billing/syncUserPlanFromStripe";

const addWalletSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  chain: z.string().default("ethereum"),
  label: z.string().max(50).optional(),
});

const deleteSchema = z.object({
  walletId: z.string().min(1, "walletId is required"),
});

const patchSchema = z.object({
  walletId: z.string().min(1, "walletId is required"),
  makePrimary: z.literal(true).optional(),
  label: z.string().max(50).nullable().optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  const wallets = await db.wallet.findMany({
    where: { userId: user.id },
    orderBy: { addedAt: "asc" },
  });

  const scores = await getCachedScores(wallets.map((w) => w.address));

  const walletsWithScores = wallets.map((w, i) => ({
    ...w,
    score: scores[i]?.score ?? null,
    grade: scores[i]?.grade ?? null,
  }));

  return NextResponse.json(
    { wallets: walletsWithScores },
    {
      headers: {
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body;
  try {
    body = addWalletSchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Invalid wallet data." },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  const effectivePlan: SubscriptionPlan = await syncUserPlanFromStripe({
    id: user.id,
    plan: user.plan,
    stripeSubId: user.stripeSubId,
    stripeCustomerId: user.stripeCustomerId,
  });
  const maxWallets = PLAN_LIMITS[effectivePlan].walletMonitors;

  const { address, chain, label } = body;
  const normalizedAddress = address.toLowerCase();

  const walletCount = await db.wallet.count({ where: { userId: user.id } });

  if (walletCount >= maxWallets) {
    return NextResponse.json(
      {
        error: "wallet_limit_reached",
        message: `Your plan allows up to ${maxWallets} wallet(s). Upgrade to add more.`,
      },
      { status: 403 }
    );
  }

  const isFirst = walletCount === 0;
  const wallet = await db.wallet.upsert({
    where: { address_chain_userId: { address: normalizedAddress, chain, userId: user.id } },
    create: { address: normalizedAddress, chain, label, isPrimary: isFirst, userId: user.id },
    update: { label },
  });

  // Background: compute score + persist history + generate alerts. Do not block the response.
  computeAndPersistScore({
    address: normalizedAddress,
    walletUserContext: { walletId: wallet.id, userId: user.id },
    keyEvent: "first_score",
  }).catch((err) => {
    console.error("[wallets] background score failed:", err);
  });

  return NextResponse.json({ wallet }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body;
  try {
    body = patchSchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Provide walletId plus makePrimary or label." },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  const wallet = await db.wallet.findFirst({
    where: { id: body.walletId, userId: user.id },
  });
  if (!wallet) {
    return NextResponse.json({ error: "wallet_not_found" }, { status: 404 });
  }

  if (body.makePrimary) {
    await db.$transaction([
      db.wallet.updateMany({
        where: { userId: user.id, isPrimary: true, NOT: { id: wallet.id } },
        data: { isPrimary: false },
      }),
      db.wallet.update({
        where: { id: wallet.id },
        data: { isPrimary: true },
      }),
    ]);
  }

  if (body.label !== undefined) {
    await db.wallet.update({
      where: { id: wallet.id },
      data: { label: body.label },
    });
  }

  const updated = await db.wallet.findUnique({ where: { id: wallet.id } });
  return NextResponse.json({ wallet: updated });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body;
  try {
    body = deleteSchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Provide a walletId string." },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  const wallet = await db.wallet.findFirst({
    where: { id: body.walletId, userId: user.id },
  });

  if (!wallet) {
    return NextResponse.json({ error: "wallet_not_found" }, { status: 404 });
  }

  if (wallet.isPrimary) {
    const replacement = await db.wallet.findFirst({
      where: { userId: user.id, NOT: { id: wallet.id } },
      orderBy: { addedAt: "asc" },
    });
    if (!replacement) {
      return NextResponse.json(
        {
          error: "cannot_delete_only_wallet",
          message: "You must have at least one wallet. Add another before removing this one.",
        },
        { status: 400 }
      );
    }
    await db.$transaction([
      db.wallet.update({
        where: { id: replacement.id },
        data: { isPrimary: true },
      }),
      db.wallet.delete({ where: { id: body.walletId } }),
    ]);
    return NextResponse.json({ deleted: true, newPrimary: replacement.id });
  }

  await db.wallet.delete({ where: { id: body.walletId } });
  return NextResponse.json({ deleted: true });
}
