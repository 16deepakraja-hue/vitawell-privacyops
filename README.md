# VitaWell PrivacyOps — Data Mapping (Phase 1)

A privacy operations tool for **VitaWell Health Technologies**, a fictional HealthTech /
telemedicine SaaS operating in **India and the EU** and subject to both **UK/EU GDPR** and
India's **DPDP Act 2023**.

This repository contains **Phase 1 only — the Data Mapping module**: a living *record of
processing* that maps how personal data flows through the business. DPIA, ROPA exports, DSAR
handling and full Vendor Management are intentionally **out of scope** for this phase.

All data shipped in the seed is taken from the VitaWell case study and is entirely fictional.

## Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Dashboard** | Counts across the data map, plus high-risk (DPIA-candidate), cross-border and special-category highlights. |
| 2 | **Processing Activities** | Every business process that touches personal data, with purpose, GDPR + DPDP legal bases, Art. 9 conditions, risk level, and the subjects/data/vendors/systems involved. |
| 3 | **Data Subjects** | Categories of people whose data is held (incl. vulnerable-subject flags). |
| 4 | **Data Categories** | Personal-data categories classified by sensitivity (ordinary / special-category / government ID / biometric). |
| 5 | **Vendors** | Third-party processors, what data they receive, location, and cross-border transfer safeguards (SCCs / EU-US DPF) + DPA status. |
| 6 | **Retention Schedule** | How long each class of data is retained and the legal/policy driver. |
| 7 | **Search** | Free-text search on every list page (server-side via Prisma). |
| 8 | **Filter** | Dropdown filters per page (risk, sensitivity type, vendor location, DPA status, cross-border…). |

## Tech stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js Route Handlers (REST JSON API)
- **ORM / DB:** Prisma ORM → PostgreSQL

Search and filtering are **server-side**: the UI controls write to the URL query string, the
server component re-queries Prisma, and the same filters are exposed as JSON API routes.

## Data model

```
ProcessingActivity ──┬─< many-to-many >── DataSubject
                     ├─< many-to-many >── DataCategory ──< RetentionSchedule
                     ├─< many-to-many >── Vendor
                     └─< many-to-many >── System
```

`ProcessingActivity` is the hub of the map: each activity links the people, the data, the
processors and the internal systems involved. `RetentionSchedule` attaches to `DataCategory`.

## Getting started

### Prerequisites

- **Node.js 18+** and npm
- **PostgreSQL 14+** running locally (or a connection string to a hosted instance)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure the database connection
cp .env.example .env
#   then edit .env and set DATABASE_URL to your PostgreSQL instance

# 3. Create the schema (creates tables from prisma/schema.prisma)
npm run prisma:migrate      # or: npm run db:push

# 4. Generate the Prisma client
npm run prisma:generate

# 5. Seed the VitaWell case-study data
npm run db:seed

# 6. Run the dev server
npm run dev
```

Open http://localhost:3000.

### Useful scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start the Next.js dev server |
| `npm run prisma:migrate` | Create/apply the database migration |
| `npm run db:push` | Push the schema without a migration history |
| `npm run db:seed` | Load the VitaWell seed data |
| `npm run db:reset` | Drop, recreate, and re-seed the database |

## API

All endpoints are `GET` and accept the same query parameters as the UI filters.

| Endpoint | Query params |
|----------|--------------|
| `/api/processing-activities` | `q`, `risk` (HIGH/MEDIUM/LOW), `crossBorder` (true) |
| `/api/data-subjects` | `q`, `vulnerable` (true) |
| `/api/data-categories` | `q`, `type` (ORDINARY/SPECIAL/GOV_ID/BIOMETRIC), `collected` (true/false) |
| `/api/vendors` | `q`, `location` (US/EU/India), `dpa` (true/false) |
| `/api/retention` | `q` |

Example:

```bash
curl "http://localhost:3000/api/processing-activities?risk=HIGH&crossBorder=true"
curl "http://localhost:3000/api/vendors?location=US"
```

Each response is `{ "count": <n>, "data": [ ... ] }`.

## Project structure

```
vitawell-privacyops/
├─ prisma/
│  ├─ schema.prisma          # Database models
│  └─ seed.ts                # VitaWell case-study seed data
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx          # Shell + sidebar
│  │  ├─ page.tsx            # Dashboard
│  │  ├─ processing-activities/page.tsx
│  │  ├─ data-subjects/page.tsx
│  │  ├─ data-categories/page.tsx
│  │  ├─ vendors/page.tsx
│  │  ├─ retention/page.tsx
│  │  └─ api/                # JSON API route handlers
│  ├─ components/            # Sidebar, DataTable, Toolbar, StatCard, Badge…
│  └─ lib/prisma.ts          # Prisma client singleton
└─ README.md
```

## Roadmap (future phases — not built yet)

- Phase 2: DPIA workflow (Teleconsultation is the flagship trigger)
- Phase 3: ROPA export (Art. 30 records)
- Phase 4: DSAR handling
- Phase 5: full Vendor / sub-processor management
