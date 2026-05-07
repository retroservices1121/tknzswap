import Link from "next/link";

export function Footer() {
  return (
    <div className="page">
      <footer className="foot">
        <div className="foot-lead">
          <div className="logo">
            tknz<span className="logo-dot" />
          </div>
          <p>
            A non-custodial swap aggregator. No proprietary order flow.
            All routing decisions are data-derived and publicly auditable in source.
          </p>
        </div>
        <div className="foot-col">
          <div className="foot-col-h">Product</div>
          <Link href="/">Swap</Link>
          <Link href="/trending">Trending</Link>
          <Link href="/embed">Widget preview</Link>
        </div>
        <div className="foot-col">
          <div className="foot-col-h">Compliance</div>
          <Link href="/framework">Framework</Link>
          <Link href="/framework">Disclosures</Link>
        </div>
        <div className="foot-col">
          <div className="foot-col-h">Resources</div>
          <Link href="/docs">Documentation</Link>
          <Link href="/docs/embed">Embed integration</Link>
          <a
            href="https://github.com/retroservices1121/tknzswap"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
        <div className="foot-base">
          <span>tknz labs · 2026 · Not investment advice</span>
          <span>Source-available · github.com/retroservices1121/tknzswap</span>
        </div>
      </footer>
    </div>
  );
}
