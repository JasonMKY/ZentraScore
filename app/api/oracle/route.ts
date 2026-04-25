// app/api/oracle/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveRequestPrincipal } from "@/lib/requestAuth";
import { PLAN_LIMITS } from "@/types";

// Contract addresses per chain (deploy CreditScoreOracle.sol to these chains)
const ORACLE_CONTRACTS: Record<string, { address: string; name: string; chainId: number }> = {
  ethereum: {
    address: process.env.ORACLE_ADDRESS_ETHEREUM ?? "0x0000000000000000000000000000000000000000",
    name: "Ethereum Mainnet",
    chainId: 1,
  },
  arbitrum: {
    address: process.env.ORACLE_ADDRESS_ARBITRUM ?? "0x0000000000000000000000000000000000000000",
    name: "Arbitrum One",
    chainId: 42161,
  },
  base: {
    address: process.env.ORACLE_ADDRESS_BASE ?? "0x0000000000000000000000000000000000000000",
    name: "Base",
    chainId: 8453,
  },
};

export async function GET() {
  // In production: check actual oracle node health via your oracle network API
  // For now, returns static status — replace with real health checks
  return NextResponse.json({
    status: "operational",
    oracleConsensus: "2/3",
    contracts: Object.fromEntries(
      Object.entries(ORACLE_CONTRACTS).map(([chain, info]) => [
        String(info.chainId),
        { oracle: info.address, name: info.name },
      ])
    ),
    updateInterval: "24h",
    scoreTTL: "7d",
    lastUpdateAt: new Date().toISOString(),
  });
}

const updateSchema = z.object({
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  chainId: z.number().int().optional().default(1),
});

export async function POST(req: Request) {
  const principal = await resolveRequestPrincipal(req);
  if (!principal) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!PLAN_LIMITS[principal.plan].oracle) {
    return NextResponse.json(
      {
        error: "plan_required",
        message: "Oracle update requests require Protocol API or Risk Analytics plan.",
      },
      { status: 403 }
    );
  }

  let body: z.infer<typeof updateSchema>;
  try {
    body = updateSchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Invalid oracle update payload." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    accepted: true,
    address: body.address,
    chainId: body.chainId,
    requestedAt: new Date().toISOString(),
    eta: "up to 2 minutes",
  });
}
