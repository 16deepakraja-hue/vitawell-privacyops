/**
 * Data-flow architecture for the VitaWell scenario.
 * Pure presentational (server component) — no client JS needed.
 * Layers: Data subjects → VitaWell platform → Processors → Jurisdictions.
 */

type Node = { label: string; sub?: string; tone?: "brand" | "red" | "amber" | "blue" | "gray" };

const toneCls: Record<NonNullable<Node["tone"]>, string> = {
  brand: "border-brand-200 bg-brand-50 text-brand-800",
  red: "border-red-200 bg-red-50 text-red-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  gray: "border-gray-200 bg-white text-gray-700",
};

function Box({ n }: { n: Node }) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-center shadow-sm ${toneCls[n.tone ?? "gray"]}`}>
      <div className="text-sm font-medium leading-tight">{n.label}</div>
      {n.sub && <div className="mt-0.5 text-[11px] opacity-70">{n.sub}</div>}
    </div>
  );
}

function Layer({ title, caption, nodes }: { title: string; caption: string; nodes: Node[] }) {
  return (
    <div className="flex-1">
      <div className="mb-2 text-center">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</div>
        <div className="text-[11px] text-gray-400">{caption}</div>
      </div>
      <div className="space-y-2">
        {nodes.map((n) => (
          <Box key={n.label} n={n} />
        ))}
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex items-center justify-center self-stretch px-1 text-gray-300">
      {/* horizontal on desktop, vertical on mobile */}
      <span className="hidden text-2xl lg:inline">→</span>
      <span className="text-2xl lg:hidden">↓</span>
    </div>
  );
}

export function ArchitectureDiagram() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start">
        <Layer
          title="Data subjects"
          caption="Whose data"
          nodes={[
            { label: "Patients / end users", sub: "India + EU · vulnerable", tone: "amber" },
            { label: "Doctors & coaches", sub: "Often contractors" },
            { label: "Corporate employees", sub: "Enrolled by employer" },
            { label: "Job applicants", sub: "Careers portal" },
          ]}
        />
        <Arrow />
        <Layer
          title="VitaWell platform"
          caption="Controller"
          nodes={[
            { label: "Telemedicine app", sub: "Video consults, booking", tone: "brand" },
            { label: "AI symptom checker", sub: "Automated triage", tone: "red" },
            { label: "EHR / clinical records", sub: "Health data", tone: "red" },
            { label: "Payments & wellness", sub: "Billing, B2B plans", tone: "brand" },
          ]}
        />
        <Arrow />
        <Layer
          title="Processors"
          caption="Third parties"
          nodes={[
            { label: "AWS", sub: "Hosting · Mumbai + Frankfurt", tone: "blue" },
            { label: "Twilio", sub: "Video / SMS · US", tone: "blue" },
            { label: "Stripe · Razorpay", sub: "Payments · US/EU · India", tone: "blue" },
            { label: "SendGrid · Mixpanel · Zendesk", sub: "Email · analytics · support · US", tone: "blue" },
            { label: "Greenhouse · Lab partner", sub: "ATS · lab fulfilment", tone: "blue" },
          ]}
        />
        <Arrow />
        <Layer
          title="Jurisdictions"
          caption="Where data flows"
          nodes={[
            { label: "🇮🇳 India", sub: "AWS Mumbai · DPDP Act 2023", tone: "gray" },
            { label: "🇪🇺 EU", sub: "AWS Frankfurt · GDPR", tone: "gray" },
            { label: "🇺🇸 United States", sub: "Vendors · SCCs + EU-US DPF", tone: "red" },
          ]}
        />
      </div>
      <p className="mt-4 border-t border-gray-100 pt-3 text-center text-xs text-gray-400">
        Personal &amp; special-category health data flows from data subjects, through VitaWell&apos;s
        platform, out to third-party processors across three jurisdictions — every US transfer
        requires GDPR Chapter V safeguards (SCCs / EU-US Data Privacy Framework).
      </p>
    </div>
  );
}
