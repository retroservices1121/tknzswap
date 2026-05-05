"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";

import { useSwapStore } from "@/store/swap";
import { useEvmQuote } from "@/hooks/useEvmQuote";
import { useSolanaQuote } from "@/hooks/useSolanaQuote";
import { useEvmSwap } from "@/hooks/useEvmSwap";
import { useSolanaSwap } from "@/hooks/useSolanaSwap";

import { TokenInput } from "./TokenInput";
import { RouteDisplay } from "./RouteDisplay";
import { FeeDisclosure } from "./FeeDisclosure";
import { ComplianceNotice } from "./ComplianceNotice";
import { SwapButton } from "./SwapButton";
import { IconArrowDown, IconGear } from "@/components/ui/Icons";

import { toRawAmount, fromRawAmount } from "@/lib/tokens";
import { sortRoutes, assignBadges } from "@/lib/sort";
import type { UnifiedRoute, RouteVenue } from "@/types/route";
import { fmtAmt } from "@/lib/format";

const SOL_VENUES: RouteVenue[] = [
  { label: "DF", bg: "#B4FF6A" },
  { label: "OB", bg: "#7DFFB3" },
  { label: "RA", bg: "#60A5FA" },
];

function dflowToUnified(quote: unknown): UnifiedRoute[] {
  if (!quote || typeof quote !== "object") return [];
  const q = quote as {
    inAmount: string;
    outAmount: string;
    routePlan?: Array<{ swapInfo?: { label?: string } }>;
  };
  const plan = q.routePlan ?? [];
  const labels = plan
    .map((p) => (p.swapInfo?.label ?? "").toUpperCase())
    .filter(Boolean)
    .slice(0, 3);
  const path = labels.length ? labels.join(" → ") : "DFLOW";

  return [
    {
      id: "dflow-best",
      layer: "dflow",
      toAmount: q.outAmount,
      // Decimals are filled in by the caller via fromRawAmount; here we leave a placeholder.
      toAmountReadable: 0,
      toAmountUSD: 0,
      fromAmountUSD: 0,
      estimatedDurationSeconds: 12,
      gasCostUSD: 0.001,
      venues: SOL_VENUES.slice(0, 2),
      pathLabel: path,
      badge: "best",
      raw: q,
    },
  ];
}

export function SwapCard() {
  const {
    from, to, amount, sort, selectedRouteId, slippageBps,
    setAmount, setSort, setSelectedRoute, flip, openModal,
  } = useSwapStore();

  const [flipping, setFlipping] = useState(false);
  const { address: evmAddress } = useAccount();
  const { publicKey: solPubkey } = useWallet();

  const isSol = from?.chainId === "solana";
  const colorClass: "green" | "blue" = isSol ? "green" : "blue";

  // Decimal-aware raw amount.
  const rawAmount = useMemo(
    () => (from && amount ? toRawAmount(amount, from.decimals) : "0"),
    [from, amount]
  );

  const sameToken =
    from && to && from.chainId === to.chainId && from.address.toLowerCase() === to.address.toLowerCase();

  // EVM quote — only when both sides are EVM and on the same chain (cross-chain via Li.Fi works
  // but this UI is single-chain swap-first; cross-chain requires both legs to be EVM).
  const evmEnabled =
    !!from &&
    !!to &&
    !sameToken &&
    from.chainId !== "solana" &&
    to.chainId !== "solana" &&
    rawAmount !== "0";

  const evmQuery = useEvmQuote({
    fromChainId: evmEnabled ? (from!.chainId as number) : 1,
    toChainId: evmEnabled ? (to!.chainId as number) : 1,
    fromToken: evmEnabled ? from!.address : "",
    toToken: evmEnabled ? to!.address : "",
    fromAmount: evmEnabled ? rawAmount : "0",
    sortBy: sort,
    enabled: evmEnabled,
  });

  // Solana quote — both sides Solana.
  const solEnabled =
    !!from &&
    !!to &&
    !sameToken &&
    from.chainId === "solana" &&
    to.chainId === "solana" &&
    rawAmount !== "0";

  const solQuery = useSolanaQuote({
    inputMint: solEnabled ? from!.address : "",
    outputMint: solEnabled ? to!.address : "",
    amount: solEnabled ? rawAmount : "0",
    slippageBps,
    enabled: solEnabled,
  });

  // Unified routes — populated from whichever engine is active.
  const routes: UnifiedRoute[] | null = useMemo(() => {
    if (isSol) {
      if (!solQuery.data || !to) return null;
      const built = dflowToUnified(solQuery.data).map((r) => ({
        ...r,
        toAmountReadable: fromRawAmount(r.toAmount, to.decimals),
        toAmountUSD: fromRawAmount(r.toAmount, to.decimals) * (to.usd ?? 0),
        fromAmountUSD: parseFloat(amount || "0") * (from?.usd ?? 0),
      }));
      return assignBadges(sortRoutes(built, sort));
    }
    if (evmQuery.data?.routes) {
      return assignBadges(sortRoutes(evmQuery.data.routes, sort));
    }
    return null;
  }, [isSol, solQuery.data, evmQuery.data, sort, to, from, amount]);

  const isLoading = isSol ? solQuery.isFetching : evmQuery.isFetching;

  const activeRoute: UnifiedRoute | null = useMemo(() => {
    if (!routes || routes.length === 0) return null;
    return routes.find((r) => r.id === selectedRouteId) ?? routes[0];
  }, [routes, selectedRouteId]);

  const flipSides = () => {
    setFlipping(true);
    flip();
    setTimeout(() => setFlipping(false), 500);
  };

  // Swap execution.
  const evmSwap = useEvmSwap();
  const solSwap = useSolanaSwap();
  const [busy, setBusy] = useState<"signing" | "confirming" | null>(null);
  const onSwap = async () => {
    if (!activeRoute) return;
    try {
      if (isSol) {
        setBusy("signing");
        await solSwap.executeSwap(activeRoute.raw as object);
      } else {
        setBusy("signing");
        // The unified route wraps the original Li.Fi route in `raw`.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await evmSwap.executeEvmSwap(activeRoute.raw as any);
      }
    } catch {
      // Errors are surfaced via the hook's `error` field; nothing to do here.
    } finally {
      setBusy(null);
    }
  };

  // Button state machine.
  const buttonState: Parameters<typeof SwapButton>[0]["state"] = (() => {
    if (busy === "signing") return "signing";
    if (busy === "confirming") return "confirming";
    if (isSol && !solPubkey) return "connect-solana";
    if (!isSol && !evmAddress) return "connect-evm";
    if (!amount || rawAmount === "0") return "enter-amount";
    if (isLoading) return "fetching";
    if (!routes || routes.length === 0) return "no-routes";
    return "ready";
  })();

  return (
    <div className={"swap-card " + (isSol ? "sol" : "evm")}>
      <div className="swap-head">
        <span className="swap-head-label">Swap</span>
        <span className={"engine-badge " + (isSol ? "green" : "blue")}>
          <span className="pulse-dot" style={{ background: isSol ? "var(--accent)" : "var(--blue)" }} />
          {isSol ? (
            <>
              <span className="brand-dflow">DFlow</span>&nbsp;engine
            </>
          ) : (
            <>
              <span className="brand-lifi">Li.Fi</span>&nbsp;engine
            </>
          )}
        </span>
        <button className="gear-btn" onClick={() => openModal({ type: "settings" })} type="button">
          <IconGear />
        </button>
      </div>

      {isSol && (
        <div className="jito-line">
          <span className="pulse-dot" style={{ background: "var(--accent)" }} />
          Jito-bundle protected · MEV-shielded execution
        </div>
      )}

      <TokenInput
        label="From"
        tok={from}
        amount={amount}
        onAmount={setAmount}
        onPick={() => openModal({ type: "token", side: "from" })}
      />

      <div className="swap-arrow-wrap">
        <button
          className={"swap-arrow" + (flipping ? " flipping" : "")}
          onClick={flipSides}
          type="button"
          aria-label="Flip"
        >
          <IconArrowDown />
        </button>
      </div>

      <TokenInput
        label="To (estimated)"
        tok={to}
        amount={activeRoute ? fmtAmt(activeRoute.toAmountReadable, 6) : ""}
        onAmount={() => {}}
        onPick={() => openModal({ type: "token", side: "to" })}
        readOnly
      />

      <RouteDisplay
        routes={routes}
        toToken={to}
        selected={activeRoute?.id ?? null}
        onSelect={setSelectedRoute}
        sort={sort}
        onSort={setSort}
        chainColor={colorClass}
        loading={isLoading && !routes}
      />

      {activeRoute && <FeeDisclosure isSol={isSol} route={activeRoute} />}

      <SwapButton
        state={buttonState}
        fromSym={from?.symbol}
        toSym={to?.symbol}
        isSol={isSol}
        onClick={onSwap}
      />

      <ComplianceNotice isSol={isSol} />
    </div>
  );
}
