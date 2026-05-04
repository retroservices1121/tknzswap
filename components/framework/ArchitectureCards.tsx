export function ArchitectureCards() {
  return (
    <section className="section">
      <div className="page">
        <div className="section-head">
          <div>
            <div className="section-kicker">02 · Execution architecture</div>
            <h2 className="section-title">Two engines. One venue-aware router.</h2>
          </div>
        </div>

        <div className="arch-grid">
          <div className="arch-card blue">
            <div className="arch-head">
              <span className="arch-layer-tag">EVM Layer</span>
            </div>
            <div className="arch-title">
              <span className="brand-lifi">Li.Fi</span> <span>routing</span>
            </div>
            <p className="arch-desc">
              Orders on EVM chains are decomposed across bridges and on-chain DEXs. Quotes are scored on net
              output after gas, not gross rate. The user receives the final net amount in the quote.
            </p>
            <div className="arch-chips">
              <span className="arch-chip">Ethereum</span>
              <span className="arch-chip">Arbitrum</span>
              <span className="arch-chip">Optimism</span>
              <span className="arch-chip">Base</span>
              <span className="arch-chip">Polygon</span>
              <span className="arch-chip">BNB</span>
            </div>
            <div className="arch-meta">
              <div>
                <div className="arch-meta-k">Bridges</div>
                <div className="arch-meta-v">42</div>
              </div>
              <div>
                <div className="arch-meta-k">Aggregators</div>
                <div className="arch-meta-v">28</div>
              </div>
              <div>
                <div className="arch-meta-k">Quote TTL</div>
                <div className="arch-meta-v">30s</div>
              </div>
            </div>
          </div>

          <div className="arch-card green">
            <div className="arch-head">
              <span className="arch-layer-tag">
                <span className="brand-solana">Solana</span> Layer
              </span>
            </div>
            <div className="arch-title">
              <span className="brand-dflow">DFlow</span> <span>order flow</span>
            </div>
            <p className="arch-desc">
              <span className="brand-solana">Solana</span> orders are submitted to the{" "}
              <span className="brand-dflow">DFlow</span> auction. Market makers compete to fill at or above the
              reference price. Price improvement is included in the displayed output, not rebated separately.
            </p>
            <div className="arch-chips">
              <span className="arch-chip">
                <span className="brand-solana">Solana</span> mainnet
              </span>
              <span className="arch-chip">Jito bundles</span>
              <span className="arch-chip">Priority fees</span>
            </div>
            <div className="arch-meta">
              <div>
                <div className="arch-meta-k">Makers</div>
                <div className="arch-meta-v">11</div>
              </div>
              <div>
                <div className="arch-meta-k">Median imp.</div>
                <div className="arch-meta-v">14 bps</div>
              </div>
              <div>
                <div className="arch-meta-k">Auction</div>
                <div className="arch-meta-v">250ms</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
