export function ComplianceNotice({ isSol }: { isSol: boolean }) {
  return (
    <div className="compliance">
      <b>SEC-compliant covered user interface.</b>{" "}
      {isSol ? (
        <>
          <span className="brand-solana">Solana</span> routing via{" "}
          <span className="brand-dflow">DFlow</span> (platformFeeBps: 15). The
          displayed output amount is the final amount; price improvement is
          reflected in the quote.
        </>
      ) : (
        <>
          <span style={{ color: "var(--text2)", fontWeight: 500 }}>EVM</span> routing via{" "}
          <span className="brand-lifi">Li.Fi</span> (fee: 0.0015). The displayed output
          amount is the final amount; route optimization is reflected in the quote.
        </>
      )}{" "}
      tknz does not custody assets and does not provide investment advice.
    </div>
  );
}
