import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge, riskTone } from "@/components/Badge";
import { RiskGauge } from "@/components/dpia/RiskGauge";
import { DpiaActions } from "@/components/dpia/DpiaActions";
import { AddRiskForm } from "@/components/dpia/AddRiskForm";
import { MitigationTracker } from "@/components/dpia/MitigationTracker";

export const dynamic = "force-dynamic";

const categoryLabels: Record<string, string> = {
  HEALTH_DATA: "Health data",
  BIOMETRIC_DATA: "Biometric data",
  CROSS_BORDER: "Cross-border",
  AUTOMATED_DECISION: "Automated decision",
  LARGE_SCALE: "Large scale",
  OTHER: "Other",
};

export default async function DpiaDetailPage({ params }: { params: { id: string } }) {
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

  const factors = [
    { label: "Special category data", on: dpia.specialCategoryData },
    { label: "International transfers", on: dpia.internationalTransfers },
    { label: "Automated decision-making", on: dpia.automatedDecisionMaking },
    { label: "Large-scale processing", on: dpia.largeScale },
  ];

  const openMitigations = dpia.risks
    .flatMap((r) => r.mitigations)
    .filter((m) => m.status !== "COMPLETED").length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/dpia" className="text-sm font-medium text-brand-700 hover:underline">
            ← DPIA Register
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{dpia.projectName}</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{dpia.purpose}</p>
        </div>
        <DpiaActions id={dpia.id} status={dpia.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: overview */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Overview
            </h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-400">Business owner</dt>
                <dd className="text-sm text-gray-800">{dpia.businessOwner}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Status</dt>
                <dd className="text-sm text-gray-800">{dpia.status.replace("_", " ")}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="mb-1 text-xs text-gray-400">Screening factors</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {factors.map((f) => (
                    <Badge key={f.label} tone={f.on ? "red" : "gray"}>
                      {f.on ? "✓ " : "– "}
                      {f.label}
                    </Badge>
                  ))}
                </dd>
              </div>
            </dl>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ScopeList title="Data subjects" items={dpia.dataSubjects.map((s) => s.category)} />
              <ScopeList title="Data categories" items={dpia.dataCategories.map((c) => c.name)} />
              <ScopeList title="Vendors" items={dpia.vendors.map((v) => v.name)} />
            </div>
          </section>

          {/* Risk Register */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Risk register
                </h2>
                <p className="text-xs text-gray-400">
                  {dpia.risks.length} risks · {openMitigations} open mitigations
                </p>
              </div>
              <AddRiskForm dpiaId={dpia.id} />
            </div>

            {dpia.risks.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
                No risks recorded. Low-risk processing may not require a full DPIA.
              </p>
            ) : (
              <ul className="space-y-4">
                {dpia.risks.map((r) => (
                  <li key={r.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{r.title}</h3>
                          <Badge tone="blue">{categoryLabels[r.category]}</Badge>
                        </div>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">{r.description}</p>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <div className="text-xs text-gray-400">
                          L{r.likelihood} × I{r.impact}
                        </div>
                        <div>
                          <span className="text-lg font-bold text-gray-900">{r.score}</span>
                          <span className="text-xs text-gray-400">/25</span>
                        </div>
                        <Badge tone={riskTone(r.level)}>{r.level}</Badge>
                      </div>
                    </div>

                    <MitigationTracker
                      riskId={r.id}
                      mitigations={r.mitigations.map((m) => ({
                        id: m.id,
                        description: m.description,
                        owner: m.owner,
                        status: m.status,
                        dueDate: m.dueDate ? m.dueDate.toISOString() : null,
                      }))}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right: score */}
        <div className="space-y-6 lg:col-span-1">
          <RiskGauge score={dpia.riskScore} level={dpia.riskLevel} />
          {dpia.riskLevel === "HIGH" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <strong>DPIA likely mandatory.</strong> High residual risk under GDPR Art. 35(3) —
              ensure mitigations are tracked to completion and consider consulting the supervisory
              authority if risk cannot be reduced.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScopeList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {title}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-gray-300">None selected</p>
      ) : (
        <ul className="space-y-1">
          {items.map((i) => (
            <li key={i} className="text-sm text-gray-700">
              • {i}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
