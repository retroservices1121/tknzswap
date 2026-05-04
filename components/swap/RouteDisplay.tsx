"use client";

import type { UnifiedRoute } from "@/types/route";
import type { SortDimension } from "@/types/swap";
import { Badge, badgeLabel } from "@/components/ui/Badge";
import { fmtAmt, fmtUSD } from "@/lib/format";
import type { Token } from "@/types/token";

interface Props {
  routes: UnifiedRoute[] | null;
  toToken: Token | null;
  selected: string | null;
  onSelect: (id: string) => void;
  sort: SortDimension;
  onSort: (s: SortDimension) => void;
  chainColor: "green" | "blue";
  loading?: boolean;
}

const SORTS: SortDimension[] = ["price", "speed", "gas"];

export function RouteDisplay({ routes, toToken, selected, onSelect, sort, onSort, chainColor, loading }: Props) {
  if (!routes || routes.length === 0) {
    if (loading) {
      return (
        <div className="routes">
          <div className="routes-head">
            <span className="routes-title">
              <span className="pulse-dot" style={{ background: chainColor === "blue" ? "var(--blue)" : "var(--accent)" }} />
              Fetching routes…
            </span>
          </div>
          <div style={{ height: 56, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12 }} />
        </div>
      );
    }
    return null;
  }

  return (
    <div className="routes">
      <div className="routes-head">
        <span className="routes-title">
          <span className="pulse-dot" style={{ background: chainColor === "blue" ? "var(--blue)" : "var(--accent)" }} />
          {routes.length} Route{routes.length === 1 ? "" : "s"} Found
        </span>
        <span className="routes-sort">
          {SORTS.map((s) => (
            <button key={s} className={sort === s ? "active" : ""} onClick={() => onSort(s)} type="button">
              {s}
            </button>
          ))}
        </span>
      </div>
      {routes.map((r) => (
        <div
          key={r.id}
          className={"route" + (selected === r.id ? " selected" : "")}
          onClick={() => onSelect(r.id)}
        >
          <div className="route-venues">
            {r.venues.map((v, j) => (
              <span key={j} className="route-venue" style={{ background: v.bg }}>
                {v.label}
              </span>
            ))}
          </div>
          <div className="route-main">
            <div className="route-out">
              {fmtAmt(r.toAmountReadable, 6)}{" "}
              <span style={{ color: "var(--text3)" }}>{toToken?.symbol ?? ""}</span>
            </div>
            <div className="route-path">{r.pathLabel}</div>
          </div>
          <div className="route-right">
            {r.badge && <Badge variant={r.badge}>{badgeLabel(r.badge)}</Badge>}
            <span className="route-time">
              {Math.round(r.estimatedDurationSeconds)}s · gas {fmtUSD(r.gasCostUSD)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
