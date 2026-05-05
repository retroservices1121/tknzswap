"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";

const NAV_LINKS: Array<{ href: string; label: string }> = [
  { href: "/", label: "Swap" },
  { href: "/routes", label: "Routes" },
  { href: "/analytics", label: "Analytics" },
  { href: "/docs", label: "Docs" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="nav">
      <div className="page nav-inner">
        <Link href="/" className="logo" style={{ textDecoration: "none", color: "inherit" }}>
          tknz<span className="logo-dot" />
        </Link>
        <div className="nav-links">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={"nav-link" + (path === l.href ? " active" : "")}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="nav-spacer" />
        <div className="nav-right">
          <span className="sec-badge">
            <span className="pulse-dot" />
            SEC Compliant Interface
          </span>
          <ConnectWalletButton />
        </div>
      </div>
    </nav>
  );
}
