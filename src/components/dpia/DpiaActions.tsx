"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = [
  { value: "DRAFT", label: "Draft" },
  { value: "IN_REVIEW", label: "In review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export function DpiaActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [busy, setBusy] = useState(false);

  async function changeStatus(next: string) {
    setBusy(true);
    setCurrent(next);
    await fetch(`/api/dpia/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this DPIA and its risk register? This cannot be undone.")) return;
    setBusy(true);
    await fetch(`/api/dpia/${id}`, { method: "DELETE" });
    router.push("/dpia");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={current}
        disabled={busy}
        onChange={(e) => changeStatus(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <a
        href={`/dpia/${id}/print`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Export PDF
      </a>
      <button
        onClick={remove}
        disabled={busy}
        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        Delete
      </button>
    </div>
  );
}
