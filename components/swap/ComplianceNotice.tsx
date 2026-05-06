interface Props {
  engine: "lifi" | "dflow" | "mayan";
}

export function ComplianceNotice({ engine }: Props) {
  return (
    <div className="compliance">
      <b>SEC-compliant covered user interface.</b>{" "}
      {engine === "dflow" && (
        <>
          <span className="brand-solana">Solana</span> routing via{" "}
          <span className="brand-dflow">DFlow</span> (platformFeeBps: 15) with Jito-bundle
          execution. The displayed output amount is the final amount; price improvement is
          reflected in the quote.
        </>
      )}
      {engine === "lifi" && (
        <>
          <span style={{ color: "var(--text2)", fontWeight: 500 }}>EVM</span> routing via{" "}
          <span className="brand-lifi">Li.Fi</span> (fee: 0.0015). The displayed output
          amount is the final amount; route optimization is reflected in the quote.
        </>
      )}
      {engine === "mayan" && (
        <>
          Cross-VM swap routed via Mayan Swift (referrerBps: 15). User funds are escrowed
          in an on-chain time-locked contract and atomically settled on the destination
          chain. The displayed output amount is the minimum guaranteed amount.
        </>
      )}{" "}
      tknz does not custody assets and does not provide investment advice.
    </div>
  );
}
