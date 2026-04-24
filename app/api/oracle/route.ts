// app/api/oracle/route.ts
import { NextResponse } from "next/server";

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
