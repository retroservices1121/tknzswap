"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";

import { useSwapStore } from "@/store/swap";
import { useEvmQuote } from "@/hooks/useEvmQuote";
import { useSolanaQuote } from "@/hooks/useSolanaQuote";
import { useCrossQuote } from "@/hooks/useCrossQuote";
import { useEvmSwap } from "@/hooks/useEvmSwap";
import { useSolanaSwap } from "@/hooks/useSolanaSwap";
import { useCrossSwap } from "@/hooks/useCrossSwap";

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
import { getExecutionLayer } from "@/lib/chains";
import type { Quote as MayanQuote } from "@mayanfinance/swap-sdk";

const SOL_VENUES: RouteVenue[] = [
  { label: "DF", bg: "#B4FF6A" },
  { label: "OB", bg: "#7DFFB3" },
  { label: "RA", bg: "#60A5FA" },
];

const MAYAN_VENUES: RouteVenue[] = [
  { label: "MY", bg: "#9945FF" },
  { label: "WH", bg: "#7DFFB3" },
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

function mayanToUnified(quote: MayanQuote, fromAmountUSD: number): UnifiedRoute[] {
  // Mayan returns relayer/bridge fees as named fields, not always USD-denominated
  // in the type — but in practice these are denominated in the bridged token's
  // value scale. Sum the visible cost fields for a conservative gas display.
  const gasCostUSD =
    (quote.swapRelayerFee ?? 0) +
    (quote.redeemRelayerFee ?? 0) +
    (quote.solanaRelayerFee ?? 0) +
    (quote.bridgeFee ?? 0);

  const path = `${quote.fromChain.toUpperCase()} → ${quote.toChain.toUpperCase()} · ${quote.type}`;

  return [
    {
      id: `mayan-${quote.type.toLowerCase()}`,
      layer: "mayan",
      toAmount: String(quote.expectedAmountOut),
      toAmountReadable: quote.expectedAmountOut,
      toAmountUSD: 0, // populated by caller using to.usd
      fromAmountUSD,
      estimatedDurationSeconds: quote.etaSeconds ?? 30,
      gasCostUSD,
      venues: MAYAN_VENUES,
      pathLabel: path,
      badge: "best",
      raw: quote,
    },
  ];
}

type Mode = "same-sol" | "same-evm" | "cross-vm";

export function SwapCard() {
  const {
    from, to, amount, sort, selectedRouteId, slippageBps,
    setAmount, setSort, setSelectedRoute, flip, openModal,
  } = useSwapStore();

  const [flipping, setFlipping] = useState(false);
  const [destinationAddress, setDestinationAddress] = useState("");
  const { address: evmAddress } = useAccount();
  const { publicKey: solPubkey } = useWallet();

  // Routing decision — single source of truth in lib/chains.ts.
  const mode: Mode = useMemo(() => {
    if (!from || !to) return "same-sol";
    const layer = getExecutionLayer(from.chainId, to.chainId);
    if (layer === "dflow") return "same-sol";
    if (layer === "lifi") return "same-evm";
    return "cross-vm";
  }, [from, to]);

  const engine: "dflow" | "lifi" | "mayan" =
    mode === "same-sol" ? "dflow" : mode === "same-evm" ? "lifi" : "mayan";
  const engineColor: "green" | "blue" | "purple" =
    mode === "same-sol" ? "green" : mode === "same-evm" ? "blue" : "purple";

  // For cross-VM mode under single-active-wallet, the user supplies a
  // destination address manually since the destination chain's wallet
  // can't be connected at the same time as the source chain's wallet.
  const destinationChainKind: "solana" | "evm" | null =
    mode === "cross-vm" && to ? (to.chainId === "solana" ? "solana" : "evm") : null;

  const isValidDestination = (addr: string, kind: "solana" | "evm"): boolean => {
    const trimmed = addr.trim();
    if (kind === "solana") return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed);
    return /^0x[a-fA-F0-9]{40}$/.test(trimmed);
  };

  const destinationOk =
    mode !== "cross-vm" ||
    (destinationChainKind && isValidDestination(destinationAddress, destinationChainKind));

  // Decimal-aware raw amount (used by same-chain engines).
  const rawAmount = useMemo(
    () => (from && amount ? toRawAmount(amount, from.decimals) : "0"),
    [from, amount]
  );

  // Human-readable float amount (used by Mayan).
  const humanAmount = useMemo(() => parseFloat(amount || "0"), [amount]);

  const sameToken =
    from && to && from.chainId === to.chainId && from.address.toLowerCase() === to.address.toLowerCase();

  // Same-chain EVM quote.
  const evmEnabled = mode === "same-evm" && !!from && !!to && !sameToken && rawAmount !== "0";
  const evmQuery = useEvmQuote({
    fromChainId: evmEnabled ? (from!.chainId as number) : 1,
    toChainId: evmEnabled ? (to!.chainId as number) : 1,
    fromToken: evmEnabled ? from!.address : "",
    toToken: evmEnabled ? to!.address : "",
    fromAmount: evmEnabled ? rawAmount : "0",
    sortBy: sort,
    enabled: evmEnabled,
  });

  // Same-chain Solana quote.
  const solEnabled = mode === "same-sol" && !!from && !!to && !sameToken && rawAmount !== "0";
  const solQuery = useSolanaQuote({
    inputMint: solEnabled ? from!.address : "",
    outputMint: solEnabled ? to!.address : "",
    amount: solEnabled ? rawAmount : "0",
    slippageBps,
    enabled: solEnabled,
  });

  // Cross-VM quote (Mayan).
  const crossEnabled = mode === "cross-vm" && !!from && !!to && humanAmount > 0;
  const crossQuery = useCrossQuote({
    fromChainId: crossEnabled ? from!.chainId : "solana",
    toChainId: crossEnabled ? to!.chainId : "solana",
    fromTokenAddress: crossEnabled ? from!.address : "",
    toTokenAddress: crossEnabled ? to!.address : "",
    amount: crossEnabled ? humanAmount : 0,
    slippageBps,
    enabled: crossEnabled,
  });

  const routes: UnifiedRoute[] | null = useMemo(() => {
    if (mode === "same-sol") {
      if (!solQuery.data || !to) return null;
      const built = dflowToUnified(solQuery.data).map((r) => ({
        ...r,
        toAmountReadable: fromRawAmount(r.toAmount, to.decimals),
        toAmountUSD: fromRawAmount(r.toAmount, to.decimals) * (to.usd ?? 0),
        fromAmountUSD: humanAmount * (from?.usd ?? 0),
      }));
      return assignBadges(sortRoutes(built, sort));
    }
    if (mode === "same-evm") {
      if (evmQuery.data?.routes) {
        return assignBadges(sortRoutes(evmQuery.data.routes, sort));
      }
      return null;
    }
    // cross-vm
    if (crossQuery.data?.quote && to) {
      const built = mayanToUnified(crossQuery.data.quote, humanAmount * (from?.usd ?? 0)).map((r) => ({
        ...r,
        toAmountUSD: r.toAmountReadable * (to.usd ?? 0),
      }));
      return built;
    }
    return null;
  }, [mode, solQuery.data, evmQuery.data, crossQuery.data, sort, to, from, humanAmount]);

  const isLoading =
    mode === "same-sol"
      ? solQuery.isFetching
      : mode === "same-evm"
        ? evmQuery.isFetching
        : crossQuery.isFetching;

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
  const crossSwap = useCrossSwap();
  const [busy, setBusy] = useState<"signing" | "confirming" | null>(null);

  const onSwap = async () => {
    if (!activeRoute) return;
    try {
      setBusy("signing");
      if (mode === "same-sol") {
        await solSwap.executeSwap(activeRoute.raw as object);
      } else if (mode === "same-evm") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await evmSwap.executeEvmSwap(activeRoute.raw as any);
      } else {
        await crossSwap.executeCrossSwap(
          activeRoute.raw as MayanQuote,
          destinationAddress.trim()
        );
      }
    } catch {
      // Errors surfaced via the per-hook `error` field.
    } finally {
      setBusy(null);
    }
  };

  // Button state machine. Under single-active-wallet, cross-VM only needs
  // the SOURCE wallet connected; destination is a manually-entered address.
  const buttonState: Parameters<typeof SwapButton>[0]["state"] = (() => {
    if (busy === "signing") return "signing";
    if (busy === "confirming") return "confirming";
    if (mode === "cross-vm") {
      const sourceIsSolana = from?.chainId === "solana";
      if (sourceIsSolana && !solPubkey) return "connect-solana";
      if (!sourceIsSolana && !evmAddress) return "connect-evm";
    } else if (mode === "same-sol" && !solPubkey) {
      return "connect-solana";
    } else if (mode === "same-evm" && !evmAddress) {
      return "connect-evm";
    }
    if (!amount || (mode === "cross-vm" ? humanAmount <= 0 : rawAmount === "0")) return "enter-amount";
    if (isLoading) return "fetching";
    if (!routes || routes.length === 0) return "no-routes";
    if (mode === "cross-vm" && !destinationOk) return "enter-destination";
    return "ready";
  })();

  return (
    <div className={"swap-card " + engineColor}>
      <div className="swap-head">
        <span className="swap-head-label">Swap</span>
        <span className={"engine-badge " + engineColor}>
          <span
            className="pulse-dot"
            style={{
              background:
                engineColor === "green"
                  ? "var(--accent)"
                  : engineColor === "blue"
                    ? "var(--blue)"
                    : "#B073FF",
            }}
          />
          {engine === "dflow" && (
            <>
              <span className="brand-dflow">DFlow</span>&nbsp;engine
            </>
          )}
          {engine === "lifi" && (
            <>
              <span className="brand-lifi">Li.Fi</span>&nbsp;engine
            </>
          )}
          {engine === "mayan" && <>Mayan&nbsp;Swift&nbsp;·&nbsp;Cross-VM</>}
        </span>
        <button className="gear-btn" onClick={() => openModal({ type: "settings" })} type="button">
          <IconGear />
        </button>
      </div>

      {mode === "same-sol" && (
        <div className="jito-line">
          <span className="pulse-dot" style={{ background: "var(--accent)" }} />
          Jito-bundle protected · MEV-shielded execution
        </div>
      )}

      {mode === "cross-vm" && (
        <div
          className="jito-line"
          style={{
            background: "rgba(153,69,255,0.06)",
            border: "1px solid rgba(153,69,255,0.22)",
            color: "#B073FF",
          }}
        >
          <span className="pulse-dot" style={{ background: "#B073FF" }} />
          Atomic cross-VM · One signature · ~{Math.round((crossQuery.data?.quote?.etaSeconds ?? 30))}s eta
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

      {mode === "cross-vm" && destinationChainKind && (
        <div className="cross-dest">
          <label className="cross-dest-label">
            Destination address ({destinationChainKind === "solana" ? "Solana" : "EVM"})
          </label>
          <input
            className={
              "cross-dest-input" +
              (destinationAddress && !destinationOk ? " invalid" : "")
            }
            type="text"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            placeholder={
              destinationChainKind === "solana"
                ? "Paste a Solana wallet address"
                : "Paste a 0x… EVM address"
            }
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
          />
          {destinationAddress && !destinationOk && (
            <div className="cross-dest-err">Invalid {destinationChainKind === "solana" ? "Solana mint-format" : "EVM 0x"} address</div>
          )}
        </div>
      )}

      <RouteDisplay
        routes={routes}
        toToken={to}
        selected={activeRoute?.id ?? null}
        onSelect={setSelectedRoute}
        sort={sort}
        onSort={setSort}
        chainColor={engineColor === "purple" ? "green" : engineColor}
        loading={isLoading && !routes}
      />

      {activeRoute && <FeeDisclosure engine={engine} route={activeRoute} />}

      <SwapButton
        state={buttonState}
        fromSym={from?.symbol}
        toSym={to?.symbol}
        engineColor={engineColor}
        onClick={onSwap}
      />

      <ComplianceNotice engine={engine} />
    </div>
  );
}
