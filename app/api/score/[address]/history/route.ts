import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const paramsSchema = z.object({
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const addrParse = paramsSchema.safeParse(params);
  if (!addrParse.success) {
    return NextResponse.json(
      { error: "invalid_address", message: "Provide a valid 0x Ethereum address" },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      wallets: { where: { address: addrParse.data.address.toLowerCase() } },
    },
  });

  if (!user || user.wallets.length === 0) {
    return NextResponse.json(
      { error: "wallet_not_found", message: "Wallet not linked to your account." },
      { status: 404 }
    );
  }

  const wallet = user.wallets[0];
  const url = new URL(req.url);
  const rawMonths = parseInt(url.searchParams.get("months") ?? "12", 10);
  const months = Math.min(Number.isNaN(rawMonths) ? 12 : Math.max(1, rawMonths), 24);

  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const history = await db.scoreHistory.findMany({
    where: {
      walletId: wallet.id,
      recordedAt: { gte: since },
    },
    orderBy: { recordedAt: "asc" },
  });

  const withDeltas = history.map((record, i) => ({
    score: record.score,
    grade: record.grade,
    factors: record.factors,
    keyEvent: record.keyEvent,
    delta: i > 0 ? record.score - history[i - 1].score : null,
    recordedAt: record.recordedAt.toISOString(),
  }));

  return NextResponse.json({
    address: addrParse.data.address,
    history: withDeltas,
    monthsRequested: months,
  });
}
