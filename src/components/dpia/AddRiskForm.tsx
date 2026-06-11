"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = [
  { value: "HEALTH_DATA", label: "Health data" },
  { value: "BIOMETRIC_DATA", label: "Biometric data" },
  { value: "CROSS_BORDER", label: "Cross-border transfer" },
  { value: "AUTOMATED_DECISION", label: "Automated decision-making" },
  { value: "LARGE_SCALE", label: "Large-scale processing" },
  { value: "OTHER", label: "Other" },
];

export function AddRiskForm({ dpiaId }: { dpiaId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("OTHER");
  const [likelihood, setLikelihood] = useState(3);
  const [impact, setImpact] = useState(3);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    await fetch("/api/risks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dpiaId, title, description, category, likelihood, impact }),
    });
    setTitle("");
    setDescription("");
    setCategory("OTHER");
    setLikelihood(3);
    setImpact(3);
    setOpen(false);
    setBusy(false);
    router.refresh();
  }

  const input =
    "rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        + Add risk
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          className={`${input} sm:col-span-2`}
          placeholder="Risk title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className={`${input} sm:col-span-2`}
          placeholder="Description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label className="text-sm text-gray-600">
          Category
          <select className={`${input} mt-1 w-full`} value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-3">
          <label className="text-sm text-gray-600">
            Likelihood
            <select
              className={`${input} mt-1 w-full`}
              value={likelihood}
              onChange={(e) => setLikelihood(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-gray-600">
            Impact
            <select
              className={`${input} mt-1 w-full`}
              value={impact}
              onChange={(e) => setImpact(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          Save risk (score {likelihood * impact})
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
