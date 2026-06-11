export function RiskGauge({ score, level }: { score: number; level: string }) {
  const color =
    level === "HIGH" ? "bg-red-500" : level === "MEDIUM" ? "bg-amber-500" : "bg-emerald-500";
  const text =
    level === "HIGH"
      ? "text-red-700 bg-red-100"
      : level === "MEDIUM"
        ? "text-amber-700 bg-amber-100"
        : "text-emerald-700 bg-emerald-100";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        Overall risk score
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-5xl font-bold text-gray-900">{score}</span>
        <span className="pb-2 text-sm text-gray-400">/ 100</span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${text}`}>
        {level} RISK
      </span>
      <p className="mt-3 text-xs text-gray-400">
        Thresholds: 0–30 Low · 31–60 Medium · 61–100 High.
      </p>
    </div>
  );
}
