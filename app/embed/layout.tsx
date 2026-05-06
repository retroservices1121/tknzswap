// Bare layout for the embeddable widget. No nav, no topbar, no footer —
// just the swap card. Embedders style their host page; we render compact.

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return <div className="embed-shell">{children}</div>;
}
