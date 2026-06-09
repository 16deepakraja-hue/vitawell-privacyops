import { ReactNode } from "react";

type Tone = "gray" | "green" | "amber" | "red" | "blue" | "purple";

const tones: Record<Tone, string> = {
  gray: "bg-gray-100 text-gray-700 ring-gray-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  purple: "bg-purple-50 text-purple-700 ring-purple-200",
};

export function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function riskTone(level: string): Tone {
  switch (level) {
    case "HIGH":
      return "red";
    case "MEDIUM":
      return "amber";
    case "LOW":
      return "green";
    default:
      return "gray";
  }
}

export function dataTypeTone(type: string): Tone {
  switch (type) {
    case "SPECIAL":
      return "red";
    case "GOV_ID":
      return "purple";
    case "BIOMETRIC":
      return "amber";
    default:
      return "blue";
  }
}
