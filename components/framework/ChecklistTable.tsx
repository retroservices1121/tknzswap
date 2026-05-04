interface Row {
  does: string;
  doesNot: string;
}

const ROWS: Row[] = [
  { does: "Display routes from third-party engines",         doesNot: "Originate proprietary quotes" },
  { does: "Sort routes by price, speed, or gas",             doesNot: "Apply editorial weighting to any route" },
  { does: "Disclose the 0.15% interface fee on every quote", doesNot: "Charge variable or hidden fees" },
  { does: "Pass user transactions to the user's wallet",     doesNot: "Custody assets at any point" },
  { does: "Default to finite token approvals",               doesNot: "Request unbounded ERC-20 allowances" },
  { does: "Attribute the execution engine in the UI",        doesNot: "Internalize or co-mingle order flow" },
];

export function ChecklistTable() {
  return (
    <section className="section">
      <div className="page">
        <div className="section-head">
          <div>
            <div className="section-kicker">03 · Operational boundary</div>
            <h2 className="section-title">What tknz does — and never does.</h2>
          </div>
        </div>

        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 18,
            overflow: "hidden",
            background: "var(--surface)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              padding: "14px 24px",
              borderBottom: "1px solid var(--border)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text3)",
            }}
          >
            <div style={{ color: "var(--accent)" }}>Does</div>
            <div style={{ color: "var(--red)" }}>Never does</div>
          </div>
          {ROWS.map((r, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                padding: "16px 24px",
                borderBottom: i === ROWS.length - 1 ? "none" : "1px solid var(--border)",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: "var(--text)",
                gap: 16,
              }}
            >
              <div>
                <span style={{ color: "var(--accent)", marginRight: 10 }}>✓</span>
                {r.does}
              </div>
              <div>
                <span style={{ color: "var(--red)", marginRight: 10 }}>✕</span>
                {r.doesNot}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
