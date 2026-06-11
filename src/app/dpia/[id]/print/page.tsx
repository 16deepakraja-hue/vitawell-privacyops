import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/dpia/PrintButton";

export const dynamic = "force-dynamic";

const categoryLabels: Record<string, string> = {
  HEALTH_DATA: "Health data",
  BIOMETRIC_DATA: "Biometric data",
  CROSS_BORDER: "Cross-border transfer",
  AUTOMATED_DECISION: "Automated decision-making",
  LARGE_SCALE: "Large-scale processing",
  OTHER: "Other",
};

export default async function DpiaPrintPage({ params }: { params: { id: string } }) {
  const dpia = await prisma.dPIA.findUnique({
    where: { id: params.id },
    include: {
      dataSubjects: true,
      dataCategories: true,
      vendors: true,
      risks: { include: { mitigations: true }, orderBy: { score: "desc" } },
    },
  });
  if (!dpia) notFound();

  const created = new Date(dpia.createdAt).toLocaleDateString();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-4 flex items-center justify-between">
        <Link href={`/dpia/${dpia.id}`} className="text-sm font-medium text-brand-700 hover:underline">
          ← Back to DPIA
        </Link>
        <PrintButton />
      </div>

      <article className="print-page rounded-xl border border-gray-200 bg-white p-10 shadow-sm">
        <header className="mb-6 border-b border-gray-200 pb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            VitaWell PrivacyOps — Data Protection Impact Assessment
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{dpia.projectName}</h1>
          <p className="mt-1 text-sm text-gray-500">
            GDPR Art. 35 · DPDP Act 2023 · Generated {created}
          </p>
        </header>

        <Section title="1. Summary">
          <Row label="Purpose of processing" value={dpia.purpose} />
          <Row label="Business owner" value={dpia.businessOwner} />
          <Row label="Status" value={dpia.status.replace("_", " ")} />
          <Row
            label="Overall risk"
            value={`${dpia.riskScore}/100 — ${dpia.riskLevel} (0–30 Low · 31–60 Medium · 61–100 High)`}
          />
        </Section>

        <Section title="2. Screening factors">
          <ul className="list-inside list-disc text-sm text-gray-700">
            <li>Special category data: {dpia.specialCategoryData ? "Yes" : "No"}</li>
            <li>International transfers: {dpia.internationalTransfers ? "Yes" : "No"}</li>
            <li>Automated decision-making: {dpia.automatedDecisionMaking ? "Yes" : "No"}</li>
            <li>Large-scale processing: {dpia.largeScale ? "Yes" : "No"}</li>
          </ul>
        </Section>

        <Section title="3. Scope">
          <Row label="Data subjects" value={dpia.dataSubjects.map((s) => s.category).join(", ") || "—"} />
          <Row label="Data categories" value={dpia.dataCategories.map((c) => c.name).join(", ") || "—"} />
          <Row label="Vendors / processors" value={dpia.vendors.map((v) => v.name).join(", ") || "—"} />
        </Section>

        <Section title="4. Risk register">
          {dpia.risks.length === 0 ? (
            <p className="text-sm text-gray-500">No risks recorded.</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left text-xs uppercase text-gray-500">
                  <th className="py-2 pr-2">Risk</th>
                  <th className="py-2 pr-2">Category</th>
                  <th className="py-2 pr-2">L×I</th>
                  <th className="py-2 pr-2">Score</th>
                  <th className="py-2">Level</th>
                </tr>
              </thead>
              <tbody>
                {dpia.risks.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 align-top">
                    <td className="py-2 pr-2">
                      <div className="font-medium text-gray-900">{r.title}</div>
                      <div className="text-xs text-gray-500">{r.description}</div>
                    </td>
                    <td className="py-2 pr-2">{categoryLabels[r.category]}</td>
                    <td className="py-2 pr-2">
                      {r.likelihood}×{r.impact}
                    </td>
                    <td className="py-2 pr-2">{r.score}/25</td>
                    <td className="py-2">{r.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        <Section title="5. Mitigation actions">
          {dpia.risks.flatMap((r) => r.mitigations).length === 0 ? (
            <p className="text-sm text-gray-500">No mitigation actions recorded.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {dpia.risks.flatMap((r) =>
                r.mitigations.map((m) => (
                  <li key={m.id} className="border-b border-gray-100 pb-2">
                    <span className="font-medium text-gray-900">{m.description}</span>
                    <div className="text-xs text-gray-500">
                      Risk: {r.title} · Owner: {m.owner} · Status: {m.status.replace("_", " ")}
                      {m.dueDate && ` · Due ${new Date(m.dueDate).toLocaleDateString()}`}
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </Section>

        <footer className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-400">
          This document was generated by VitaWell PrivacyOps. VitaWell is a fictional company; all
          data is illustrative.
        </footer>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-base font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-1.5 grid grid-cols-3 gap-2 text-sm">
      <dt className="text-gray-400">{label}</dt>
      <dd className="col-span-2 text-gray-800">{value}</dd>
    </div>
  );
}
