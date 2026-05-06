export const metadata = {
  title: "tknz · Embed widget",
  description: "Drop the tknz swap widget into any web product with one line of HTML.",
};

const IFRAME_SNIPPET = `<iframe
  src="https://tknz.xyz/embed?from=USDC&fromChain=solana&to=SOL&toChain=solana"
  width="460"
  height="720"
  style="border: 0; border-radius: 16px;"
  allow="clipboard-write"
  title="tknz swap widget"
></iframe>`;

const REACT_SNIPPET = `export function TknzWidget({ from = "USDC", to = "SOL", chain = "solana" }) {
  const src = \`https://tknz.xyz/embed?from=\${from}&fromChain=\${chain}&to=\${to}&toChain=\${chain}\`;
  return (
    <iframe
      src={src}
      width="460"
      height="720"
      style={{ border: 0, borderRadius: 16 }}
      allow="clipboard-write"
      title="tknz swap widget"
    />
  );
}`;

const QUERY_PARAMS = [
  { p: "from", v: "Token symbol for source side (e.g. USDC, SOL, ETH)" },
  { p: "fromChain", v: "Chain for source. \"solana\" or an EVM chainId (1, 8453, 42161, 10, 137, 56)" },
  { p: "to", v: "Token symbol for destination side" },
  { p: "toChain", v: "Chain for destination. Same format as fromChain" },
];

export default function EmbedDocsPage() {
  return (
    <main className="page" style={{ paddingTop: 56, paddingBottom: 80 }}>
      <span className="kicker">
        <span className="chip-tag">B2B</span>
        Integration · Iframe widget
      </span>
      <h1 className="headline" style={{ fontSize: 56, marginTop: 18, marginBottom: 12 }}>
        Embed the swap.
      </h1>
      <p className="lede" style={{ maxWidth: 640 }}>
        Drop the tknz swap widget into any web product with one line of HTML. The widget
        carries the same routing, fee, custody, and disclosure architecture as the standalone
        interface — every operating-boundary representation in our SEC compliance framework
        applies inside the iframe identically.
      </p>

      <article
        className="arch-card"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", marginTop: 32 }}
      >
        <div className="arch-head">
          <span className="arch-layer-tag">01 · IFRAME</span>
        </div>
        <div className="arch-title" style={{ fontSize: 24 }}>Plain HTML embed</div>
        <pre
          style={{
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 14,
            fontFamily: "var(--font-mono)",
            fontSize: 11.5,
            lineHeight: 1.7,
            overflowX: "auto",
            color: "var(--text)",
            margin: "16px 0 0",
          }}
        >
          <code>{IFRAME_SNIPPET}</code>
        </pre>
      </article>

      <article
        className="arch-card"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", marginTop: 18 }}
      >
        <div className="arch-head">
          <span className="arch-layer-tag">02 · REACT</span>
        </div>
        <div className="arch-title" style={{ fontSize: 24 }}>React wrapper</div>
        <pre
          style={{
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 14,
            fontFamily: "var(--font-mono)",
            fontSize: 11.5,
            lineHeight: 1.7,
            overflowX: "auto",
            color: "var(--text)",
            margin: "16px 0 0",
          }}
        >
          <code>{REACT_SNIPPET}</code>
        </pre>
      </article>

      <article
        className="arch-card"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", marginTop: 18 }}
      >
        <div className="arch-head">
          <span className="arch-layer-tag">03 · QUERY PARAMETERS</span>
        </div>
        <div className="arch-title" style={{ fontSize: 24 }}>Preset the swap card</div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 16,
            fontFamily: "var(--font-mono)",
            fontSize: 12,
          }}
        >
          <tbody>
            {QUERY_PARAMS.map((p) => (
              <tr key={p.p} style={{ borderBottom: "1px solid var(--border)" }}>
                <td
                  style={{
                    padding: "10px 12px 10px 0",
                    color: "var(--accent)",
                    width: 130,
                    verticalAlign: "top",
                  }}
                >
                  {p.p}
                </td>
                <td style={{ padding: "10px 0", color: "var(--text2)" }}>{p.v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      <article
        className="arch-card"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", marginTop: 18 }}
      >
        <div className="arch-head">
          <span className="arch-layer-tag">04 · WHAT THE EMBEDDER GETS</span>
        </div>
        <div className="arch-title" style={{ fontSize: 24 }}>Full execution stack, zero custody</div>
        <ul
          style={{
            margin: "16px 0 0",
            paddingLeft: 20,
            color: "var(--text2)",
            fontSize: 14,
            lineHeight: 1.8,
          }}
        >
          <li>Solana swaps via DFlow with Jito-bundle protection</li>
          <li>EVM swaps via Li.Fi across 6 chains and 42 bridges</li>
          <li>Cross-VM (EVM ↔ Solana) via Mayan Swift in one signature</li>
          <li>~600 verified Solana tokens via the Jupiter registry</li>
          <li>Flat 0.15% interface fee, disclosed on every quote</li>
          <li>End user signs in their own wallet — no custody transfer to embedder</li>
        </ul>
      </article>

      <article
        className="arch-card"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", marginTop: 18 }}
      >
        <div className="arch-head">
          <span className="arch-layer-tag">05 · COMMERCIAL TERMS</span>
        </div>
        <div className="arch-title" style={{ fontSize: 24 }}>Volume-tier licensing available</div>
        <p className="arch-desc" style={{ maxWidth: 720 }}>
          The default embed serves the same 0.15% economics as our standalone interface.
          For B2B partners (RIAs, neobanks, payments processors, treasury platforms) we
          offer revenue-share and white-label licensing terms. Contact us at{" "}
          <a href="mailto:partners@tknz.xyz" style={{ color: "var(--accent)" }}>
            partners@tknz.xyz
          </a>
          .
        </p>
      </article>
    </main>
  );
}
