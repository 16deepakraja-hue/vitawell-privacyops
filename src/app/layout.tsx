import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "VitaWell PrivacyOps — Data Mapping",
  description:
    "Phase 1 Data Mapping module: record of processing activities, data subjects, data categories, vendors and retention for VitaWell Health Technologies (GDPR & DPDP Act 2023).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-x-hidden px-8 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
