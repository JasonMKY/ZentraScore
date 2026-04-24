# ZentraScore — On-Chain Credit Intelligence

A full-stack Next.js app that computes real credit scores from blockchain data using Alchemy, Covalent, Clerk, Stripe, PostgreSQL, and Redis.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth + Wallet | Clerk |
| Blockchain data | Alchemy SDK + Covalent GoldRush API |
| Payments | Stripe |
| Database | PostgreSQL via Prisma |
| Cache | Redis (Upstash or self-hosted) |
| Language | TypeScript |

---

## Setup (30 minutes end-to-end)

### 1. Clone and install

```bash
git clone https://github.com/your-org/zentrascore
cd zentrascore
npm install
```

### 2. Copy env file and fill in keys

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in each value. Instructions per service:

**Clerk** → [dashboard.clerk.com](https://dashboard.clerk.com)
- Create a new application
- Enable "Web3 / Ethereum" as an authentication method
- Copy publishable key and secret key
- Go to Webhooks → Add endpoint → `https://your-domain/api/webhooks/clerk`
- Add the `CLERK_WEBHOOK_SECRET` to `.env.local`

**Alchemy** → [dashboard.alchemy.com](https://dashboard.alchemy.com)
- Create an app for Ethereum Mainnet (free tier works)
- Copy the API key
- Optionally create separate apps for Arbitrum and Base

**Covalent** → [goldrush.dev](https://goldrush.dev)
- Sign up → Get API Key (free tier: 100 req/day)

**Stripe** → [dashboard.stripe.com](https://dashboard.stripe.com)
- Create 3 products: Consumer ($9/mo), Protocol API ($499/mo), Analytics ($299/mo)
- Copy the Price IDs for each product
- Copy your publishable and secret keys
- Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` for local webhook testing

**PostgreSQL** — Use one of:
- [Supabase](https://supabase.com) — free hosted Postgres, copy the connection string
- [Neon](https://neon.tech) — serverless Postgres, generous free tier
- Local: `docker run -e POSTGRES_PASSWORD=password -p 5432:5432 postgres`

**Redis** — Use one of:
- [Upstash](https://upstash.com) — free serverless Redis, copy the `REDIS_URL`
- Local: `docker run -p 6379:6379 redis`

### 3. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to your database (creates all tables)
npm run db:push

# Seed with test data
npm run db:seed
```

### 4. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

---

## Architecture

```
app/
  api/
    score/
      [address]/
        route.ts          # GET — compute/return score
        history/route.ts  # GET — score history for a wallet
      batch/route.ts      # POST — score up to 500 wallets
    alerts/
      route.ts            # GET/PATCH — list and mark read
      preferences/route.ts # GET/PATCH — alert settings
    checkout/route.ts     # POST — create Stripe checkout session
    wallets/route.ts      # GET/POST/DELETE — manage wallets
    oracle/route.ts       # GET — oracle status
    webhooks/
      stripe/route.ts     # POST — Stripe events (plan changes)
      clerk/route.ts      # POST — Clerk events (user sync)
      route.ts            # GET/POST/DELETE — user webhook endpoints
  dashboard/
    page.tsx              # Protected dashboard page (server component)
  layout.tsx              # Root layout with ClerkProvider

components/
  dashboard/
    DashboardClient.tsx   # Client component with real data bindings

hooks/
  useScore.ts             # React hook for fetching scores
  useWallet.ts            # React hook for MetaMask connection

lib/
  db.ts                   # Prisma client singleton
  cache.ts                # Redis cache + rate limiting
  scoring/
    engine.ts             # Core scoring algorithm (300–850)
    fetcher.ts            # Alchemy + Covalent data fetching
  webhooks/
    dispatcher.ts         # Fires webhook endpoints on score changes

prisma/
  schema.prisma           # Database schema
  seed.ts                 # Development seed data

types/
  index.ts                # All TypeScript types

middleware.ts             # Clerk route protection
```

---

## API Reference

### Public endpoints (no auth required)

```
GET /api/score/{address}           Compute score for any wallet
GET /api/score/{address}/history   12-month score history (auth required)
GET /api/oracle                    Oracle status and contract addresses
```

### Authenticated endpoints

```
POST /api/score/batch              Score up to 500 wallets (Protocol plan)
GET  /api/wallets                  List your wallets with scores
POST /api/wallets                  Add a wallet to your account
DEL  /api/wallets                  Remove a wallet
GET  /api/alerts                   Fetch your alerts
PATCH /api/alerts                  Mark alerts as read
GET  /api/alerts/preferences       Get alert preferences
PATCH /api/alerts/preferences      Update alert preferences
POST /api/checkout                 Create Stripe checkout session
GET  /api/webhooks                 List webhook endpoints (Protocol plan)
POST /api/webhooks                 Register a webhook endpoint
DEL  /api/webhooks                 Delete a webhook endpoint
```

---

## Scoring Algorithm

Six factors, each scored 0–100, combined via weighted average then mapped to 300–850:

| Factor | Weight | Data source |
|---|---|---|
| Repayment history | 35% | Covalent DeFi positions |
| Liquidation record | 20% | Alchemy transfers + Covalent health factors |
| Wallet age | 15% | Alchemy first transaction timestamp |
| Asset diversity | 15% | Alchemy token balances |
| Protocol breadth | 10% | Covalent DeFi protocol list |
| Portfolio stability | 5% | Transfer value variance |

Anti-fraud checks (circular fund flow, wash repayments, burst activity) run before scoring and apply score penalties if triggered.

---

## Deploying to Production

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Add all env vars in the Vercel dashboard under Settings → Environment Variables.

Set these Stripe and Clerk webhook URLs in their respective dashboards:
- Stripe: `https://your-domain.vercel.app/api/webhooks/stripe`
- Clerk: `https://your-domain.vercel.app/api/webhooks/clerk`

### Database

For production, use Supabase or Neon with connection pooling enabled. Add `?pgbouncer=true&connection_limit=1` to your `DATABASE_URL` when using Vercel serverless functions.

---

## Smart Contract (Optional)

The `CreditScoreOracle.sol` contract allows DeFi protocols to read scores on-chain without an API key.

```solidity
interface ICreditScoreOracle {
    function getScore(address wallet)
        external view returns (uint16 score, bool valid);
}
```

Deploy with Hardhat or Foundry. Set `ORACLE_ADDRESS_ETHEREUM`, `ORACLE_ADDRESS_ARBITRUM`, and `ORACLE_ADDRESS_BASE` in your env.

The oracle network calls `POST /api/oracle/update` → your backend verifies and calls `proposeScore()` on the contract → 2-of-3 oracle consensus → score written on-chain.

---

## Improving Score Accuracy

The current scoring uses Covalent's portfolio API as a proxy for repayment history. For production-grade accuracy:

1. **Index The Graph** — deploy a subgraph that listens to `Borrow`, `Repay`, and `LiquidationCall` events from Aave V2/V3, Compound V2/V3, MakerDAO. This gives you exact repayment rates rather than balance-based estimates.

2. **Multi-chain aggregation** — run `fetchWalletData` in parallel for Ethereum + Arbitrum + Base and combine scores.

3. **Time-weighted factors** — recent repayments should count more than old ones. Add a decay factor to the repayment history calculation.

4. **Liquidation event parsing** — parse actual `LiquidationCall` events from The Graph rather than the approximate detection in `engine.ts`.

---

## License

MIT
