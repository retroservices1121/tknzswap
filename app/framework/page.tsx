import { FrameworkGrid } from "@/components/framework/FrameworkGrid";
import { ArchitectureCards } from "@/components/framework/ArchitectureCards";
import { ChecklistTable } from "@/components/framework/ChecklistTable";

export const metadata = {
  title: "tknz · Compliance framework",
  description:
    "How tknz operates as a covered user interface under the SEC's April 13 2026 staff statement.",
};

export default function FrameworkPage() {
  return (
    <>
      <main className="page" style={{ paddingTop: 56 }}>
        <span className="kicker">
          <span className="chip-tag">Framework</span>
          Covered user interface · Rule 15b9-1
        </span>
        <h1 className="headline" style={{ fontSize: 56, marginTop: 18, marginBottom: 12 }}>
          The compliance framework,
          <br />
          <span className="brand-solana">explained</span>.
        </h1>
        <p className="lede" style={{ maxWidth: 640 }}>
          tknz operates as a covered user interface in accordance with the SEC Division of Trading
          and Markets staff statement (April 13 2026). This page documents the operational
          boundaries that make that designation defensible — at the code level, not just policy.
        </p>
      </main>
      <FrameworkGrid />
      <ArchitectureCards />
      <ChecklistTable />
    </>
  );
}
