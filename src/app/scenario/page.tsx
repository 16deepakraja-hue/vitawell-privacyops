import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/Badge";
import { ArchitectureDiagram } from "@/components/scenario/ArchitectureDiagram";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Business Scenario — VitaWell PrivacyOps",
  description: "The VitaWell Health Technologies case study that seeds this platform.",
};

export default async function ScenarioPage() {
  const [activities, subjects, categories, vendors, dpias, highRisk] = await Promise.all([
    prisma.processingActivity.count(),
    prisma.dataSubject.count(),
    prisma.dataCategory.count(),
    prisma.vendor.count(),
    prisma.dPIA.count(),
    prisma.dPIA.count({ where: { riskLevel: "HIGH" } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Hero */}
      <header className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="green">Onboarding</Badge>
          <Badge tone="gray">2–3 min read</Badge>
          <Badge tone="amber">Fictional case study</Badge>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">The VitaWell Business Scenario</h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          This platform is seeded with a realistic privacy case study. Read this first — it gives
          you the business context behind every processing activity, vendor and DPIA you&apos;ll see
          in the Data Mapping and DPIA modules.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <HeroStat value={activities} label="Activities" />
          <HeroStat value={subjects} label="Data subjects" />
          <HeroStat value={categories} label="Data categories" />
          <HeroStat value={vendors} label="Vendors" />
          <HeroStat value={dpias} label="DPIAs" />
          <HeroStat value={highRisk} label="High-risk" tone="red" />
        </div>
      </header>

      {/* Company overview */}
      <Section title="1 · Company overview" anchor="overview">
        <p className="text-gray-600">
          <strong>VitaWell Health Technologies Pvt. Ltd.</strong> is a HealthTech / digital-health
          SaaS company headquartered in <strong>Bengaluru, India</strong> (founded 2019). It runs a
          telemedicine and corporate-wellness app serving <strong>~600,000 registered users</strong>,
          with <strong>~250 employees</strong> and <strong>~40 corporate clients</strong>.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Fact label="Sector" value="HealthTech / Digital Health SaaS" />
          <Fact label="Markets" value="India and the European Union" />
          <Fact label="Hosting" value="AWS — Mumbai (India) & Frankfurt (EU)" />
          <Fact label="Applicable law" value="GDPR (EU) + DPDP Act 2023 (India)" />
          <Fact label="Founded" value="2019" />
          <Fact label="Product" value="Telemedicine + corporate-wellness app" />
        </dl>
      </Section>

      {/* Business model */}
      <Section title="2 · Business model" anchor="model">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card title="B2C — Direct-to-consumer" tone="brand">
            Individual patients in India and the EU download the app, register, and pay per
            consultation or via subscription. They book video consultations, use the symptom checker,
            receive e-prescriptions, and book lab tests.
          </Card>
          <Card title="B2B — Corporate wellness" tone="blue">
            Employers buy wellness plans for their staff. VitaWell bulk-enrols employees, provides
            consultations and coaching, and gives the employer <strong>aggregated, anonymized</strong>{" "}
            wellness reporting — never individual health data.
          </Card>
        </div>
      </Section>

      {/* Services */}
      <Section title="3 · Services offered" anchor="services">
        <div className="flex flex-wrap gap-2">
          {[
            "Video doctor consultations",
            "AI symptom checker",
            "E-prescriptions",
            "Wellness coaching",
            "Lab-test booking",
            "Corporate wellness programs",
          ].map((s) => (
            <span key={s} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm">
              {s}
            </span>
          ))}
        </div>
      </Section>

      {/* Personal data */}
      <Section title="4 · Personal data processed" anchor="data">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card title="Ordinary personal data" tone="blue">
            Name, email, phone, date of birth, gender, address, government ID (for KYC), IP address,
            app-usage data, payment-card token, employer name, appointment history, emergency contact.
          </Card>
          <Card title="Special-category / sensitive data" tone="red">
            <strong>Health data</strong> — symptoms, diagnoses, prescriptions, lab results,
            mental-health coaching notes (GDPR Art. 9). <strong>Government identifiers</strong> —
            Aadhaar / PAN / passport (highly sensitive in India).
          </Card>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          <Badge tone="gray">Confirmed during mapping</Badge>{" "}
          Biometric &amp; genetic data are <strong>not currently collected</strong> — an explicit
          scoping decision recorded in the data map.
        </p>
      </Section>

      {/* Architecture / data flows */}
      <Section
        title="5 · Data-flow architecture"
        anchor="architecture"
        subtitle="Patient → VitaWell platform → processors → cross-border data flows"
      >
        <ArchitectureDiagram />
      </Section>

      {/* International flows */}
      <Section title="6 · International data flows" anchor="transfers">
        <ul className="space-y-2 text-gray-600">
          <Bullet>
            <strong>EU ↔ India:</strong> EU patient data is accessed by Bengaluru-based clinical and
            support staff — a restricted transfer requiring GDPR Chapter V safeguards (Standard
            Contractual Clauses) and a transfer risk assessment.
          </Bullet>
          <Bullet>
            <strong>To US-based vendors</strong> (Twilio, SendGrid, Mixpanel, Greenhouse, Stripe):
            transfers rely on <strong>SCCs and/or the EU-US Data Privacy Framework</strong>, with a
            Schrems II–style assessment of US government-access risk.
          </Bullet>
          <Bullet>
            <strong>Data residency control:</strong> EU users&apos; data is stored in AWS Frankfurt;
            India users&apos; data in AWS Mumbai.
          </Bullet>
        </ul>
      </Section>

      {/* Vendors */}
      <Section title="7 · Vendors / processors involved" anchor="vendors">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["AWS", "Cloud hosting (sub-processor)", "India + EU"],
            ["Stripe", "Payments (EU users)", "US/EU"],
            ["Razorpay", "Payments (India users)", "India"],
            ["Twilio", "Video consultations & SMS/OTP", "US"],
            ["SendGrid", "Transactional + marketing email", "US"],
            ["Zendesk", "Customer support tickets", "US/EU"],
            ["Mixpanel", "Product analytics", "US"],
            ["Greenhouse", "Recruitment ATS", "US"],
            ["Diagnostic-lab partner", "Lab-test fulfilment", "India"],
          ].map(([name, role, loc]) => (
            <div key={name} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{name}</span>
                <Badge tone={loc.includes("US") ? "amber" : "green"}>{loc}</Badge>
              </div>
              <div className="mt-0.5 text-xs text-gray-500">{role}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-gray-500">
          9+ processors — each relationship should be governed by a Data Processing Agreement (DPA),
          with sub-processors tracked.
        </p>
      </Section>

      {/* Compliance challenges */}
      <Section title="8 · GDPR &amp; DPDP compliance challenges" anchor="compliance">
        <Card title="Dual-regime compliance" tone="amber">
          VitaWell must satisfy <strong>two regimes simultaneously</strong>: the EU/UK GDPR and
          India&apos;s DPDP Act 2023. Each processing activity needs a valid basis under{" "}
          <em>both</em> — e.g. GDPR Art. 6/Art. 9 conditions plus a DPDP basis — and the stricter
          requirement usually wins. Large-scale special-category health data, a web of third-party
          processors, and cross-border transfers make this a textbook high-accountability
          environment.
        </Card>
      </Section>

      {/* Privacy challenges */}
      <Section title="9 · Privacy challenges" anchor="challenges">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ChallengeCard title="Health data processing" tone="red">
            Diagnoses, prescriptions and mental-health notes are GDPR Art. 9 special-category data.
            Unauthorised disclosure can cause serious harm, so it demands explicit consent /
            healthcare-provision conditions, strict access control, and encryption.
          </ChallengeCard>
          <ChallengeCard title="Cross-border transfers" tone="amber">
            EU↔India access and US-based processors trigger GDPR Chapter V. SCCs, the EU-US DPF and
            transfer risk assessments are required — and must be documented, not assumed.
          </ChallengeCard>
          <ChallengeCard title="AI-assisted decision making" tone="red">
            The AI symptom checker performs automated triage on health data. Without human review it
            risks falling under GDPR Art. 22, with fairness, transparency and safety obligations.
          </ChallengeCard>
          <ChallengeCard title="Employee wellness processing" tone="amber">
            Corporate-enrolled employees create an <strong>employer–employee power imbalance</strong>,
            which undermines &quot;freely given&quot; consent and means employers must only ever see
            aggregated, non-identifiable data.
          </ChallengeCard>
          <ChallengeCard title="Vendor management risk" tone="blue">
            9+ processors and sub-processors (AWS, Twilio, Stripe, etc.) each receive personal data.
            Missing DPAs, untracked sub-processors or unassessed transfers are a primary source of
            compliance failure.
          </ChallengeCard>
          <ChallengeCard title="Why some activities are high-risk" tone="red">
            <strong>Teleconsultation &amp; AI triage</strong> combines special-category data, large
            scale, vulnerable subjects, new technology <em>and</em> cross-border transfers — which is
            exactly why it scores highest and sits at the centre of the DPIA program.
          </ChallengeCard>
        </div>
      </Section>

      {/* Why DPIAs */}
      <Section title="10 · Why DPIAs are required" anchor="dpia">
        <p className="text-gray-600">
          Under <strong>GDPR Art. 35</strong>, a DPIA is mandatory when processing is{" "}
          <em>likely to result in a high risk</em> to individuals — for example large-scale
          special-category data, systematic monitoring, or new technologies. VitaWell hits multiple
          triggers at once:
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "Special-category health data",
            "Large-scale processing",
            "Vulnerable data subjects",
            "New technology (AI triage)",
            "Cross-border transfers",
            "Automated decision-making",
          ].map((t) => (
            <Badge key={t} tone="red">
              {t}
            </Badge>
          ))}
        </div>
        <p className="mt-3 text-sm text-gray-500">
          The DPIA module scores each project against these factors (Health +20, Biometric +25,
          Cross-border +15, Automated decision +20, Large-scale +20) and routes the high-risk ones
          for mitigation tracking.
        </p>
      </Section>

      {/* CTA */}
      <section className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-lg font-semibold text-gray-900">Now explore the platform</h2>
        <p className="mt-1 text-sm text-gray-500">
          With the business context in mind, review the records this scenario generated.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/processing-activities"
            className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            → Data Mapping (Processing Activities)
          </Link>
          <Link
            href="/dpia"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            → DPIA Register
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            → Dashboard
          </Link>
        </div>
      </section>

      <p className="mt-6 text-center text-xs text-gray-400">
        VitaWell Health Technologies is a fictional company created for privacy training and
        portfolio demonstration. Any resemblance to a real company is coincidental.
      </p>
    </div>
  );
}

/* ---- local presentational helpers ---- */

function HeroStat({ value, label, tone }: { value: number; label: string; tone?: "red" }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white/70 p-3 text-center shadow-sm">
      <div className={`text-2xl font-bold ${tone === "red" ? "text-red-600" : "text-gray-900"}`}>
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wide text-gray-400">{label}</div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  anchor,
  children,
}: {
  title: string;
  subtitle?: string;
  anchor: string;
  children: React.ReactNode;
}) {
  return (
    <section id={anchor} className="mt-8 scroll-mt-8">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="mb-3 mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      <div className={subtitle ? "" : "mt-3"}>{children}</div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <dt className="text-[11px] uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-800">{value}</dd>
    </div>
  );
}

const cardTone: Record<string, string> = {
  brand: "border-brand-200 bg-brand-50",
  blue: "border-blue-200 bg-blue-50",
  red: "border-red-200 bg-red-50",
  amber: "border-amber-200 bg-amber-50",
};

function Card({
  title,
  tone = "brand",
  children,
}: {
  title: string;
  tone?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${cardTone[tone]}`}>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{children}</p>
    </div>
  );
}

function ChallengeCard({
  title,
  tone = "blue",
  children,
}: {
  title: string;
  tone?: string;
  children: React.ReactNode;
}) {
  const dot =
    tone === "red" ? "bg-red-500" : tone === "amber" ? "bg-amber-500" : "bg-blue-500";
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="flex items-center gap-2 font-semibold text-gray-900">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-gray-600">{children}</p>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="mt-1 text-brand-500">•</span>
      <span>{children}</span>
    </li>
  );
}
