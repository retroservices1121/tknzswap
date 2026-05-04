interface Pillar {
  num: string;
  title: string;
  body: string;
  accent: "green" | "blue";
}

const PILLARS: Pillar[] = [
  {
    num: "01",
    title: "Non-custodial routing",
    body: "tknz never takes custody of user assets. All swaps execute via the user's connected wallet signing a transaction directly to the execution engine.",
    accent: "green",
  },
  {
    num: "02",
    title: "No proprietary order flow",
    body: "Orders are routed to third-party engines (Li.Fi, DFlow). tknz does not internalize, front-run, or co-mingle order flow with proprietary trading.",
    accent: "blue",
  },
  {
    num: "03",
    title: "Data-derived presentation",
    body: "Routes are sorted only on price, speed, or gas. Badges (BEST PRICE, FASTEST, LOW GAS) are computed from quote data — never editorial.",
    accent: "green",
  },
  {
    num: "04",
    title: "Flat, disclosed fee",
    body: "A single 0.15% interface fee is disclosed on every quote. No variable fees, no hidden spread, no PFOF rebate paid to the user.",
    accent: "blue",
  },
  {
    num: "05",
    title: "Engine attribution",
    body: "Every active quote attributes its execution engine in the UI. EVM swaps go through Li.Fi; Solana swaps go through DFlow. Never the other way.",
    accent: "green",
  },
  {
    num: "06",
    title: "Finite token approvals",
    body: "Token approvals default to the exact amount required for the swap. tknz does not request unbounded allowances and does not override Li.Fi's approval defaults.",
    accent: "blue",
  },
];

export function FrameworkGrid() {
  return (
    <section className="section">
      <div className="page">
        <div className="section-head">
          <div>
            <div className="section-kicker">01 · Compliance pillars</div>
            <h2 className="section-title">Six rules. Enforced in code.</h2>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
          }}
        >
          {PILLARS.map((p) => (
            <div key={p.num} className={`arch-card ${p.accent}`}>
              <div className="arch-head">
                <span className="arch-layer-tag">{p.num}</span>
              </div>
              <div
                className="arch-title"
                style={{ fontSize: 22, lineHeight: 1.15 }}
              >
                {p.title}
              </div>
              <p className="arch-desc" style={{ marginTop: 12 }}>
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
