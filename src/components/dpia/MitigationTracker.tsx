"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mitigation = {
  id: string;
  description: string;
  owner: string;
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED";
  dueDate: string | null;
};

const statusStyles: Record<Mitigation["status"], string> = {
  OPEN: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

export function MitigationTracker({
  riskId,
  mitigations,
}: {
  riskId: string;
  mitigations: Mitigation[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [busy, setBusy] = useState(false);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/mitigations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/mitigations/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !owner.trim()) return;
    setBusy(true);
    await fetch("/api/mitigations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ riskId, description, owner, dueDate: dueDate || null }),
    });
    setDescription("");
    setOwner("");
    setDueDate("");
    setAdding(false);
    setBusy(false);
    router.refresh();
  }

  const input =
    "rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Mitigations ({mitigations.length})
        </span>
        <button
          onClick={() => setAdding((v) => !v)}
          className="text-xs font-medium text-brand-700 hover:underline"
        >
          {adding ? "Cancel" : "+ Add mitigation"}
        </button>
      </div>

      {mitigations.length > 0 && (
        <ul className="space-y-2">
          {mitigations.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="text-gray-800">{m.description}</p>
                <p className="text-xs text-gray-400">
                  Owner: {m.owner}
                  {m.dueDate && ` · Due ${new Date(m.dueDate).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={m.status}
                  onChange={(e) => updateStatus(m.id, e.target.value)}
                  className={`rounded-full border-0 px-2 py-1 text-xs font-semibold ${statusStyles[m.status]}`}
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <button
                  onClick={() => remove(m.id)}
                  className="text-xs text-gray-400 hover:text-red-600"
                  aria-label="Delete mitigation"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <form onSubmit={add} className="mt-2 flex flex-wrap items-end gap-2">
          <input
            className={`${input} flex-1`}
            placeholder="Mitigation / control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <input
            className={input}
            placeholder="Owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            required
          />
          <input
            type="date"
            className={input}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            Add
          </button>
        </form>
      )}
    </div>
  );
}
