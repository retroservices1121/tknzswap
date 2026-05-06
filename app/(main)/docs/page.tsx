export const metadata = {
  title: "tknz · Documentation",
  description: "Integration notes, fee structure, and execution-engine attribution.",
};

interface Section {
  kicker: string;
  title: string;
  body: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    kicker: "01 · ROUTING",
    title: "Two engines. One decision point.",
    body: (
      <>
        The user&apos;s chain selection is the only routing decision tknz ever makes. Solana orders
        are routed exclusively to <span className="brand-dflow">DFlow</span>. EVM orders are routed
        exclusively to <span className="brand-lifi">Li.Fi</span>. The two engines never overlap —
        Li.Fi is never invoked for Solana, and DFlow is never invoked for any EVM chain.
      </>
    ),
  },
  {
    kicker: "02 · FEES",
    title: "Flat 0.15% on every quote.",
    body: (
      <>
        On EVM, the interface fee is passed to Li.Fi as <code>fee: 0.0015</code> (a float, not basis
        points). On Solana, the same fee is passed to DFlow as <code>platformFeeBps: 15</code> (an
        integer in basis points). EVM fees accumulate in Li.Fi&apos;s on-chain fee collector and are
        claimed periodically; Solana fees land in the configured fee account on every swap.
      </>
    ),
  },
  {
    kicker: "03 · PRICE IMPROVEMENT",
    title: "Baked into the displayed amount.",
    body: (
      <>
        Both engines surface price improvement structurally — embedded in the <code>toAmount</code>
        the user sees in the quote. There is no separate rebate cashflow, no offset meter, and no
        savings badge. The number you see is the number you receive.
      </>
    ),
  },
  {
    kicker: "04 · EXECUTION",
    title: "User-signed, never custodial.",
    body: (
      <>
        Solana transactions return as base64-encoded VersionedTransactions; the client deserializes,
        signs with the connected wallet, and broadcasts. EVM transactions are executed via Li.Fi&apos;s
        SDK using the connected wallet client. tknz never holds or signs on behalf of the user.
      </>
    ),
  },
  {
    kicker: "05 · APPROVALS",
    title: "Finite by default.",
    body: (
      <>
        EVM token approvals are constrained to the exact swap amount via Li.Fi&apos;s default
        behavior. tknz does not request unbounded ERC-20 allowances and does not override the SDK&apos;s
        approval safeguards.
      </>
    ),
  },
  {
    kicker: "06 · ENV",
    title: "Required environment variables.",
    body: (
      <>
        See <code>.env.local.example</code>. <code>DFLOW_API_KEY</code> is server-only and must
        never be prefixed <code>NEXT_PUBLIC_</code>. <code>LIFI_INTEGRATOR</code> must match the
        string registered at <code>portal.li.fi</code> exactly.
      </>
    ),
  },
];

export default function DocsPage() {
  return (
    <main className="page" style={{ paddingTop: 56, paddingBottom: 80 }}>
      <span className="kicker">
        <span className="chip-tag">Docs</span>
        Build and integration notes
      </span>
      <h1 className="headline" style={{ fontSize: 56, marginTop: 18, marginBottom: 28 }}>
        Documentation.
      </h1>

      <div style={{ display: "grid", gap: 18 }}>
        {SECTIONS.map((s) => (
          <article
            key={s.kicker}
            className="arch-card"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="arch-head">
              <span className="arch-layer-tag">{s.kicker}</span>
            </div>
            <div className="arch-title" style={{ fontSize: 26 }}>
              {s.title}
            </div>
            <p className="arch-desc" style={{ maxWidth: 720 }}>
              {s.body}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
