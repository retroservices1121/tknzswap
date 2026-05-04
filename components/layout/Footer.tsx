export function Footer() {
  return (
    <div className="page">
      <footer className="foot">
        <div className="foot-lead">
          <div className="logo">
            tknz<span className="logo-dot" />
          </div>
          <p>
            A covered user interface operated in accordance with SEC Rule 15b9-1.
            Non-custodial. No proprietary order flow. All routing decisions are data-derived.
          </p>
        </div>
        <div className="foot-col">
          <div className="foot-col-h">Product</div>
          <a>Swap</a>
          <a>Routes</a>
        </div>
        <div className="foot-col">
          <div className="foot-col-h">Compliance</div>
          <a>Covered UI policy</a>
          <a>Disclosures</a>
        </div>
        <div className="foot-col">
          <div className="foot-col-h">Resources</div>
          <a>Documentation</a>
          <a>Venue coverage</a>
        </div>
        <div className="foot-base">
          <span>tknz labs · 2026 · Not investment advice</span>
          <span>BUILD 1.4.2 · DEPLOYED 2D AGO</span>
        </div>
      </footer>
    </div>
  );
}
