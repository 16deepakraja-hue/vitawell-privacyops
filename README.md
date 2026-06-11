# VitaWell PrivacyOps

A privacy operations tool for **VitaWell Health Technologies**, a fictional HealthTech /
telemedicine SaaS operating in **India and the EU** and subject to both **UK/EU GDPR** and
India's **DPDP Act 2023**.

Built in phases:

- **Phase 1 — Data Mapping**: a living *record of processing* that maps how personal data flows
  through the business.
- **Phase 2 — DPIA**: Data Protection Impact Assessments with an automated risk-scoring engine,
  a risk register, mitigation tracking and PDF export (GDPR Art. 35). Integrates directly with the
  Phase 1 inventory.

ROPA exports, DSAR handling and full Vendor Management remain on the roadmap.
All data shipped in the seed is taken from the VitaWell case study and is entirely fictional.

## Features

### Phase 1 — Data Mapping

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Dashboard** | Counts across the data map, plus high-risk, cross-border and special-category highlights, and a DPIA-program summary. |
| 2 | **Processing Activities** | Every business process that touches personal data, with purpose, GDPR + DPDP legal bases, Art. 9 conditions, risk level, and the subjects/data/vendors/systems involved. |
| 3 | **Data Subjects** | Categories of people whose data is held (incl. vulnerable-subject flags). |
| 4 | **Data Categories** | Personal-data categories classified by sensitivity (ordinary / special-category / government ID / biometric). |
| 5 | **Vendors** | Third-party processors, what data they receive, location, and cross-border transfer safeguards (SCCs / EU-US DPF) + DPA status. |
| 6 | **Retention Schedule** | How long each class of data is retained and the legal/policy driver. |
| 7 | **Search** | Free-text search on every list page (server-side via Prisma). |
| 8 | **Filter** | Dropdown filters per page (risk, sensitivity type, vendor location, DPA status, cross-border…). |

### Phase 2 — DPIA

| Feature | Description |
|---------|-------------|
| **DPIA register** (`/dpia`) | All assessments with risk scores + dashboard statistics (totals by level, open mitigations). Searchable & filterable. |
| **New DPIA** (`/dpia/new`) | Form capturing project name, purpose, business owner, data subjects/categories/vendors (from the Phase 1 inventory), and screening factors — with a **live risk-score preview**. |
| **DPIA detail** (`/dpia/[id]`) | Overview, risk gauge, risk register and mitigation tracking, workflow status, and PDF export. |
| **Risk-scoring engine** | Health +20, Biometric +25, Cross-border +15, Automated decision-making +20, Large-scale +20 (capped at 100). Levels: 0–30 Low · 31–60 Medium · 61–100 High. See `src/lib/risk-engine.ts`. |
| **Risk Register** | Each triggered factor becomes a risk (likelihood × impact). Risks can also be added manually. |
| **Mitigation Tracking** | Add/track controls per risk with owner, due date and status (Open / In progress / Completed). |
| **PDF export** | A print-optimised report at `/dpia/[id]/print` → "Print / Save as PDF". |

## Tech stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js Route Handlers (REST JSON API)
- **ORM / DB:** Prisma ORM → PostgreSQL

Search and filtering are **server-side**: the UI controls write to the URL query string, the
server component re-queries Prisma, and the same filters are exposed as JSON API routes.

## Data model

```
ProcessingActivity ──┬─< many-to-many >── DataSubject ──────┐
                     ├─< many-to-many >── DataCategory ──< RetentionSchedule
                     ├─< many-to-many >── Vendor ────────────┤
                     └─< many-to-many >── System             │
                                                             │
DPIA ──┬─< many-to-many >── DataSubject / DataCategory / Vendor  (re-uses the inventory)
       └──< Risk ──< MitigationAction
```

`ProcessingActivity` is the hub of the map: each activity links the people, the data, the
processors and the internal systems involved. `RetentionSchedule` attaches to `DataCategory`.

A `DPIA` re-uses the same `DataSubject` / `DataCategory` / `Vendor` inventory, and owns a
`Risk` register; each `Risk` owns its `MitigationAction`s (cascade-deleted with the DPIA).

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

> **Upgrading an existing Phase 1 database to Phase 2?** The schema gained the `DPIA`, `Risk`
> and `MitigationAction` models. Apply the change with a new migration and reseed:
>
> ```bash
> npx prisma migrate dev --name add_dpia
> npm run db:seed
> ```

### Useful scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start the Next.js dev server |
| `npm run prisma:migrate` | Create/apply the database migration |
| `npm run db:push` | Push the schema without a migration history |
| `npm run db:seed` | Load the VitaWell seed data |
| `npm run db:reset` | Drop, recreate, and re-seed the database |

## API

### Data Mapping (read-only `GET`, same query params as the UI filters)

| Endpoint | Query params |
|----------|--------------|
| `/api/processing-activities` | `q`, `risk` (HIGH/MEDIUM/LOW), `crossBorder` (true) |
| `/api/data-subjects` | `q`, `vulnerable` (true) |
| `/api/data-categories` | `q`, `type` (ORDINARY/SPECIAL/GOV_ID/BIOMETRIC), `collected` (true/false) |
| `/api/vendors` | `q`, `location` (US/EU/India), `dpa` (true/false) |
| `/api/retention` | `q` |

### DPIA

| Method & endpoint | Purpose |
|-------------------|---------|
| `GET /api/dpia` | List DPIAs (`q`, `level`, `status`) |
| `POST /api/dpia` | Create a DPIA — runs the scoring engine and auto-generates the risk register |
| `GET /api/dpia/[id]` | Fetch one DPIA with risks + mitigations |
| `PATCH /api/dpia/[id]` | Update workflow status (DRAFT / IN_REVIEW / APPROVED / REJECTED) |
| `DELETE /api/dpia/[id]` | Delete a DPIA (cascades to risks & mitigations) |
| `POST /api/risks` | Add a manual risk to a DPIA |
| `DELETE /api/risks/[id]` | Remove a risk |
| `POST /api/mitigations` | Add a mitigation action to a risk |
| `PATCH /api/mitigations/[id]` | Update a mitigation (status/owner/due date) |
| `DELETE /api/mitigations/[id]` | Remove a mitigation |

Example:

```bash
curl "http://localhost:3000/api/processing-activities?risk=HIGH&crossBorder=true"
curl "http://localhost:3000/api/dpia?level=HIGH"
curl -X POST http://localhost:3000/api/dpia -H "Content-Type: application/json" \
  -d '{"projectName":"New telehealth feature","purpose":"...","businessOwner":"DPO","specialCategoryData":true,"internationalTransfers":true,"largeScale":true}'
```

Read endpoints respond `{ "count": <n>, "data": [ ... ] }`; mutations respond `{ "data": {...} }`.

## Project structure

```
vitawell-privacyops/
├─ prisma/
│  ├─ schema.prisma          # Database models (Data Mapping + DPIA)
│  └─ seed.ts                # VitaWell case-study seed data + 3 sample DPIAs
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx          # Shell + sidebar
│  │  ├─ page.tsx            # Dashboard
│  │  ├─ processing-activities/ · data-subjects/ · data-categories/ · vendors/ · retention/
│  │  ├─ dpia/               # DPIA register, /new, /[id], /[id]/print
│  │  └─ api/                # JSON API route handlers (incl. dpia, risks, mitigations)
│  ├─ components/
│  │  ├─ Sidebar.tsx, DataTable.tsx, Toolbar.tsx, StatCard.tsx, Badge.tsx, PageHeader.tsx
│  │  └─ dpia/               # DpiaForm, RiskGauge, DpiaActions, AddRiskForm, MitigationTracker, PrintButton
│  └─ lib/
│     ├─ prisma.ts           # Prisma client singleton
│     └─ risk-engine.ts      # DPIA risk-scoring engine
└─ README.md
```

## Roadmap (future phases — not built yet)

- Phase 3: ROPA export (Art. 30 records)
- Phase 4: DSAR handling
- Phase 5: full Vendor / sub-processor management
