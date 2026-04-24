// prisma/seed.ts
// Seeds the database with test data for local development.
// Run with: npm run db:seed

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

/** tsx does not load .env.local; mirror Next/Prisma env for DATABASE_URL. */
function loadEnvFiles() {
  for (const name of [".env", ".env.local"] as const) {
    const filepath = join(process.cwd(), name);
    if (!existsSync(filepath)) continue;
    for (const line of readFileSync(filepath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}
loadEnvFiles();

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create a test user (use a real Clerk user ID from your dashboard)
  const user = await db.user.upsert({
    where: { email: "dev@zentrascore.io" },
    create: {
      clerkId: "user_dev_placeholder", // Replace with real Clerk user ID
      email: "dev@zentrascore.io",
      name: "Dev User",
      plan: "PROTOCOL",
      wallets: {
        create: [
          {
            address: "0x71c7656ec7ab88b098defb751b7401b5f6d8973f",
            chain: "ethereum",
            isPrimary: true,
            label: "Main wallet",
          },
          {
            address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
            chain: "ethereum",
            isPrimary: false,
            label: "Vitalik.eth",
          },
        ],
      },
      alertPrefs: {
        create: {
          scoreChangeEnabled: true,
          scoreChangeDelta: 20,
          liquidationEnabled: true,
          liquidationHF: 1.3,
          weeklyDigestEnabled: true,
        },
      },
    },
    update: {},
    include: { wallets: true },
  });

  console.log(`✅ Created user: ${user.email}`);

  // Seed score history for the primary wallet
  const primaryWallet = user.wallets.find((w) => w.isPrimary);
  if (primaryWallet) {
    const months = 12;
    const baseScore = 680;

    await db.scoreHistory.deleteMany({ where: { walletId: primaryWallet.id } });

    const historyData = Array.from({ length: months }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (months - 1 - i));
      const score = baseScore + Math.round((i / months) * 54) + Math.round(Math.random() * 10 - 5);

      const events = [
        "Aave V3 loan repaid",
        "New Compound position opened",
        "Liquidation risk avoided",
        "Score recalibration",
        "Uniswap LP added",
        "MakerDAO CDP closed",
        "Stablecoin holdings increased",
        null,
      ];

      return {
        walletId: primaryWallet.id,
        score: Math.min(Math.max(score, 300), 850),
        grade: score >= 740 ? "Very Good" : score >= 670 ? "Good" : "Fair",
        delta: i > 0 ? score - (baseScore + Math.round(((i - 1) / months) * 54)) : null,
        keyEvent: events[i % events.length],
        recordedAt: date,
        factors: {
          repaymentHistory: 75 + i * 1,
          liquidationRecord: 85,
          walletAge: 50 + i * 2,
          assetDiversity: 60,
          protocolBreadth: 70,
          portfolioStability: 45,
        },
      };
    });

    await db.scoreHistory.createMany({ data: historyData });
    console.log(`✅ Created ${months} months of score history`);
  }

  // Seed some test alerts
  await db.alert.deleteMany({ where: { userId: user.id } });
  await db.alert.createMany({
    data: [
      {
        userId: user.id,
        type: "SCORE_CHANGE",
        title: "Score increased by 22 points",
        message: "Your score increased from 712 to 734 after repaying $5,000 on Compound.",
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
      },
      {
        userId: user.id,
        type: "LIQUIDATION_RISK",
        title: "Liquidation risk warning",
        message: "Collateral health factor on Aave dropped to 1.41. Consider adding collateral.",
        read: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1d ago
      },
      {
        userId: user.id,
        type: "NEW_ELIGIBILITY",
        title: "New protocol available",
        message: "Clearpool now supports your score tier — eligible for 11.4% APR.",
        read: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3d ago
      },
    ],
  });
  console.log("✅ Created test alerts");

  console.log("\n🎉 Seeding complete!");
  console.log("⚠️  Remember to update clerkId in seed.ts with your real Clerk user ID");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
