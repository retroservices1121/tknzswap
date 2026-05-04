interface Props {
  state:
    | "connect-evm"
    | "connect-solana"
    | "enter-amount"
    | "fetching"
    | "no-routes"
    | "ready"
    | "signing"
    | "confirming"
    | "complete";
  fromSym?: string;
  toSym?: string;
  isSol: boolean;
  onClick?: () => void;
}

export function SwapButton({ state, fromSym, toSym, isSol, onClick }: Props) {
  const colorClass = isSol ? "green" : "blue";
  const disabled =
    state === "connect-evm" ||
    state === "connect-solana" ||
    state === "enter-amount" ||
    state === "fetching" ||
    state === "no-routes" ||
    state === "signing" ||
    state === "confirming";

  const label = (() => {
    switch (state) {
      case "connect-evm": return "Connect EVM wallet";
      case "connect-solana": return "Connect Solana wallet";
      case "enter-amount": return "Enter amount";
      case "fetching": return "Fetching routes…";
      case "no-routes": return "No routes found";
      case "signing": return "Signing…";
      case "confirming": return "Confirming…";
      case "complete": return "Swap complete";
      case "ready": return `Swap ${fromSym} → ${toSym}`;
    }
  })();

  return (
    <button
      type="button"
      className={"swap-btn " + (disabled ? "disabled" : colorClass)}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
