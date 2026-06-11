"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; label: string; isBiometric?: boolean; isSpecial?: boolean };

type Props = {
  subjects: Option[];
  categories: Option[];
  vendors: Option[];
};

// Client-side mirror of the scoring weights (for the live preview only;
// the server re-computes authoritatively in /api/dpia).
const WEIGHTS = {
  health: 20,
  biometric: 25,
  crossBorder: 15,
  automated: 20,
  largeScale: 20,
};

function levelFor(score: number) {
  if (score <= 30) return { label: "LOW", cls: "bg-emerald-100 text-emerald-800" };
  if (score <= 60) return { label: "MEDIUM", cls: "bg-amber-100 text-amber-800" };
  return { label: "HIGH", cls: "bg-red-100 text-red-800" };
}

export function DpiaForm({ subjects, categories, vendors }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [projectName, setProjectName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [businessOwner, setBusinessOwner] = useState("");
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [vendorIds, setVendorIds] = useState<string[]>([]);
  const [internationalTransfers, setInternationalTransfers] = useState(false);
  const [automatedDecisionMaking, setAutomatedDecisionMaking] = useState(false);
  const [specialCategoryData, setSpecialCategoryData] = useState(false);
  const [largeScale, setLargeScale] = useState(false);

  const selectedHasSpecial = categories.some((c) => categoryIds.includes(c.id) && c.isSpecial);
  const selectedHasBiometric = categories.some((c) => categoryIds.includes(c.id) && c.isBiometric);

  const preview = useMemo(() => {
    let s = 0;
    if (specialCategoryData || selectedHasSpecial) s += WEIGHTS.health;
    if (selectedHasBiometric) s += WEIGHTS.biometric;
    if (internationalTransfers) s += WEIGHTS.crossBorder;
    if (automatedDecisionMaking) s += WEIGHTS.automated;
    if (largeScale) s += WEIGHTS.largeScale;
    const score = Math.min(s, 100);
    return { score, level: levelFor(score) };
  }, [
    specialCategoryData,
    selectedHasSpecial,
    selectedHasBiometric,
    internationalTransfers,
    automatedDecisionMaking,
    largeScale,
  ]);

  function toggle(list: string[], set: (v: string[]) => void, id: string) {
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/dpia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          purpose,
          businessOwner,
          internationalTransfers,
          automatedDecisionMaking,
          specialCategoryData,
          largeScale,
          dataSubjectIds: subjectIds,
          dataCategoryIds: categoryIds,
          vendorIds: vendorIds,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Failed to create DPIA");
      }
      const { data } = await res.json();
      router.push(`/dpia/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
  const fieldset = "rounded-xl border border-gray-200 bg-white p-5 shadow-sm";

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className={fieldset}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Project details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Project name *</label>
              <input
                className={input}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Teleconsultation platform"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Purpose of processing *
              </label>
              <textarea
                className={input}
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Describe why this processing happens…"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Business owner *</label>
              <input
                className={input}
                value={businessOwner}
                onChange={(e) => setBusinessOwner(e.target.value)}
                placeholder="e.g. Head of Clinical Operations"
                required
              />
            </div>
          </div>
        </div>

        <div className={fieldset}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Scope (from Data Mapping inventory)
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <CheckGroup
              title="Data subjects"
              options={subjects}
              selected={subjectIds}
              onToggle={(id) => toggle(subjectIds, setSubjectIds, id)}
            />
            <CheckGroup
              title="Data categories"
              options={categories}
              selected={categoryIds}
              onToggle={(id) => toggle(categoryIds, setCategoryIds, id)}
            />
            <CheckGroup
              title="Vendors"
              options={vendors}
              selected={vendorIds}
              onToggle={(id) => toggle(vendorIds, setVendorIds, id)}
            />
          </div>
        </div>

        <div className={fieldset}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Risk screening factors
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FactorToggle
              label="Special category data"
              hint={`+${WEIGHTS.health}`}
              checked={specialCategoryData || selectedHasSpecial}
              disabled={selectedHasSpecial}
              onChange={setSpecialCategoryData}
            />
            <FactorToggle
              label="Biometric data (auto-detected)"
              hint={`+${WEIGHTS.biometric}`}
              checked={selectedHasBiometric}
              disabled
              onChange={() => {}}
            />
            <FactorToggle
              label="International transfers"
              hint={`+${WEIGHTS.crossBorder}`}
              checked={internationalTransfers}
              onChange={setInternationalTransfers}
            />
            <FactorToggle
              label="Automated decision-making"
              hint={`+${WEIGHTS.automated}`}
              checked={automatedDecisionMaking}
              onChange={setAutomatedDecisionMaking}
            />
            <FactorToggle
              label="Large-scale processing"
              hint={`+${WEIGHTS.largeScale}`}
              checked={largeScale}
              onChange={setLargeScale}
            />
          </div>
          {selectedHasBiometric && (
            <p className="mt-3 text-xs text-amber-700">
              Biometric data detected from a selected data category — scored automatically.
            </p>
          )}
        </div>
      </div>

      {/* Live score preview + submit */}
      <div className="lg:col-span-1">
        <div className="sticky top-8 space-y-4">
          <div className={fieldset}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Live risk score
            </h2>
            <div className="mt-4 flex items-end gap-3">
              <span className="text-5xl font-bold text-gray-900">{preview.score}</span>
              <span className="pb-2 text-sm text-gray-400">/ 100</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${
                  preview.level.label === "HIGH"
                    ? "bg-red-500"
                    : preview.level.label === "MEDIUM"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
                style={{ width: `${preview.score}%` }}
              />
            </div>
            <span
              className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${preview.level.cls}`}
            >
              {preview.level.label} RISK
            </span>
            <p className="mt-3 text-xs text-gray-400">
              Recalculated server-side on save. A high score indicates a DPIA is likely mandatory
              under GDPR Art. 35.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create DPIA"}
          </button>
        </div>
      </div>
    </form>
  );
}

function CheckGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: Option[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</div>
      <div className="space-y-1.5">
        {options.map((o) => (
          <label key={o.id} className="flex cursor-pointer items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              checked={selected.includes(o.id)}
              onChange={() => onToggle(o.id)}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function FactorToggle({
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm ${
        checked ? "border-brand-300 bg-brand-50" : "border-gray-200 bg-white"
      } ${disabled ? "opacity-70" : "cursor-pointer"}`}
    >
      <span className="flex items-center gap-2">
        <input
          type="checkbox"
          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </span>
      <span className="text-xs font-medium text-gray-400">{hint}</span>
    </label>
  );
}
