import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { fetchDefiPositions } from "@/lib/scoring/fetcher";

const querySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  chain: z
    .enum(["ethereum", "arbitrum", "base", "avalanche", "unichain"])
    .optional(),
});

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    address: url.searchParams.get("address") ?? "",
    chain: url.searchParams.get("chain") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", message: "Provide a valid 0x address." },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  const wallet = await db.wallet.findFirst({
    where: { userId: user.id, address: parsed.data.address.toLowerCase() },
  });
  if (!wallet) {
    return NextResponse.json(
      { error: "wallet_not_found", message: "Wallet is not linked to your account." },
      { status: 404 }
    );
  }

  try {
    const chain = parsed.data.chain ?? wallet.chain;
    const positions = await fetchDefiPositions(parsed.data.address, chain);
    return NextResponse.json({
      address: parsed.data.address,
      chain,
      positions,
    });
  } catch (err) {
    console.error("[wallet-positions] fetch failed:", err);
    return NextResponse.json(
      { error: "fetch_failed", message: "Failed to load on-chain positions." },
      { status: 503 }
    );
  }
}
