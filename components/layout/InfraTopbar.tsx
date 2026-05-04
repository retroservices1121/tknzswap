export function InfraTopbar() {
  return (
    <div className="infra-topbar">
      <div className="page infra-topbar-inner">
        <span className="infra-pill blue">
          <span className="pulse-dot blue" />
          EVM via <span className="brand-lifi">Li.Fi</span>
        </span>
        <span className="infra-sep" />
        <span className="infra-pill green">
          <span className="pulse-dot" />
          <span className="brand-solana">Solana</span> via <span className="brand-dflow">DFlow</span>
        </span>
        <span className="infra-meta">
          <span>
            LATENCY <b>48MS</b>
          </span>
          <span>
            ROUTES <b>312 ACTIVE</b>
          </span>
          <span>
            BLOCK <b>#20481992</b>
          </span>
        </span>
      </div>
    </div>
  );
}
