"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";

const NAV_LINKS: Array<{ href: string; label: string }> = [
  { href: "/", label: "Swap" },
  { href: "/trending", label: "Trending" },
  { href: "/framework", label: "Framework" },
  { href: "/docs", label: "Docs" },
];

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  // Close the menu when the route changes.
  useEffect(() => {
    setOpen(false);
  }, [path]);

  // Close on ESC and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

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
          <button
            type="button"
            className={"nav-burger" + (open ? " open" : "")}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-menu" onClick={() => setOpen(false)}>
          <div className="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-links">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={"mobile-menu-link" + (path === l.href ? " active" : "")}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="mobile-menu-foot">
              <span className="sec-badge" style={{ display: "inline-flex" }}>
                <span className="pulse-dot" />
                SEC Compliant Interface
              </span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
