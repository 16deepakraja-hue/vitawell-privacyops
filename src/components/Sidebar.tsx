"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard", icon: "▦" },
  { href: "/processing-activities", label: "Processing Activities", icon: "⚙" },
  { href: "/data-subjects", label: "Data Subjects", icon: "👥" },
  { href: "/data-categories", label: "Data Categories", icon: "🗂" },
  { href: "/vendors", label: "Vendors", icon: "🏢" },
  { href: "/retention", label: "Retention Schedule", icon: "⏳" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="px-5 py-6">
        <div className="text-lg font-bold text-brand-700">VitaWell</div>
        <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
          PrivacyOps · Data Mapping
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map((l) => {
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-base">{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 text-[11px] leading-relaxed text-gray-400">
        Phase 1 · GDPR &amp; DPDP Act 2023
      </div>
    </aside>
  );
}
