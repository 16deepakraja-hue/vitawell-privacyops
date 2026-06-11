# Deploying VitaWell PrivacyOps to Vercel

Stack: **Next.js 14 + Prisma + PostgreSQL**. This guide uses a serverless Postgres
provider (Neon or Vercel Postgres) because Vercel functions need **connection pooling**.

## What's already configured for you

- `prisma/schema.prisma` declares both a pooled `url` (`DATABASE_URL`) and a direct
  `directUrl` (`DIRECT_URL`), plus the Vercel query-engine binary target
  (`rhel-openssl-3.0.x`).
- `package.json` has:
  - `"postinstall": "prisma generate"` — regenerates the client on every Vercel install.
  - `"vercel-build": "prisma generate && prisma migrate deploy && next build"` — applies
    migrations and builds on every deploy.

So on Vercel you only need a database and two environment variables.

---

## Step 1 — Push the latest code to GitHub

Vercel deploys from GitHub, so the deploy-readiness changes must be on `main`:

```bash
git add .
git commit -m "Make project Vercel/Prisma deploy-ready"
git push origin main
```

## Step 2 — Create a PostgreSQL database

**Option A — Neon (recommended, free tier):**
1. Sign up at https://neon.tech and create a project (pick a region near your users).
2. In the project dashboard open **Connection Details**.
3. Copy two connection strings:
   - **Pooled** (has `-pooler` in the host) → this is your `DATABASE_URL`.
   - **Direct** (no `-pooler`) → this is your `DIRECT_URL`.
   - Ensure each ends with `?sslmode=require` (Neon provides this).

**Option B — Vercel Postgres (easiest, auto-wires env vars):**
1. In your Vercel project → **Storage** → **Create Database** → **Postgres**.
2. Vercel injects `POSTGRES_PRISMA_URL` (pooled) and `POSTGRES_URL_NON_POOLING` (direct).
3. In Step 4 below, set `DATABASE_URL = POSTGRES_PRISMA_URL` and
   `DIRECT_URL = POSTGRES_URL_NON_POOLING` (reference them or copy the values).

## Step 3 — Import the project into Vercel

1. Go to https://vercel.com/new and **Import** the `vitawell-privacyops` GitHub repo.
2. Framework preset: **Next.js** (auto-detected).
3. Leave Build & Output settings as default — the `vercel-build` script is picked up
   automatically. Do **not** override the build command.

## Step 4 — Set environment variables

In the import screen (or **Project → Settings → Environment Variables**) add, for all
environments (Production, Preview, Development):

| Name | Value |
|------|-------|
| `DATABASE_URL` | the **pooled** connection string |
| `DIRECT_URL` | the **direct** connection string |

> Neon pooled URLs should include `?sslmode=require&pgbouncer=true&connect_timeout=15`.
> The direct URL just needs `?sslmode=require`.

## Step 5 — Deploy

Click **Deploy**. During build, `vercel-build` runs:
`prisma generate` → `prisma migrate deploy` (creates all tables from your committed
migrations) → `next build`. First deploy takes 1–2 minutes.

## Step 6 — Seed the production database (one-time)

`migrate deploy` creates the tables but does **not** seed data. Seed once from your
machine, pointing at the **production** database:

**PowerShell (Windows):**
```powershell
$env:DATABASE_URL="<your pooled URL>"
$env:DIRECT_URL="<your direct URL>"
npx prisma db seed
```

**bash/macOS/Linux:**
```bash
DATABASE_URL="<pooled URL>" DIRECT_URL="<direct URL>" npx prisma db seed
```

Re-open your Vercel URL — the dashboard, Data Mapping, DPIA and Business Scenario pages
should now show the VitaWell data. Done.

---

## Troubleshooting

- **"Prisma Client could not locate the Query Engine for runtime rhel-openssl-3.0.x"** —
  ensure `binaryTargets` in `schema.prisma` includes `"rhel-openssl-3.0.x"` and redeploy
  (clear build cache: Deployments → ⋯ → Redeploy → uncheck "Use existing build cache").
- **"Too many connections" / timeouts** — you're using the **direct** URL as
  `DATABASE_URL`. Swap it for the **pooled** URL.
- **Migrations didn't apply** — check the build log for `prisma migrate deploy`; it needs
  `DIRECT_URL` set. Confirm both env vars exist for the Production environment.
- **Build fails on `prisma generate`** — confirm `prisma` is in `devDependencies` (it is)
  and that Vercel installs dev deps (default).
- **Schema changed after first deploy** — create a migration locally
  (`npx prisma migrate dev --name <change>`), commit it, and push; `vercel-build` applies
  it automatically on the next deploy.
