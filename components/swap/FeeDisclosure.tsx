import { fmtUSD } from "@/lib/format";
import { LIFI_FEE_FLOAT, FEE_DISPLAY_PCT } from "@/lib/fee";
import type { UnifiedRoute } from "@/types/route";

interface Props {
  engine: "lifi" | "dflow" | "mayan";
  route: UnifiedRoute;
}

export function FeeDisclosure({ engine, route }: Props) {
  const feeUSD = route.fromAmountUSD * LIFI_FEE_FLOAT;
  const gasUSD = route.gasCostUSD;
  const totalUSD = feeUSD + gasUSD;

  const paramText = (() => {
    if (engine === "dflow") {
      return (
        <>
          <span className="brand-dflow">DFlow</span> price improvement
        </>
      );
    }
    if (engine === "lifi") {
      return (
        <>
          <span className="brand-lifi">Li.Fi</span> route optimization
        </>
      );
    }
    return <>Mayan Swift cross-VM settlement</>;
  })();

  const gasLabel = engine === "mayan" ? "Network + relayer fees" : "Network gas";

  return (
    <div className="fees">
      <div className="fee-row">
        <span className="fee-label">
          tknz fee{" "}
          <span className="info-i" title={`Flat ${FEE_DISPLAY_PCT} protocol fee`}>
            i
          </span>
        </span>
        <span className="fee-val">
          {fmtUSD(feeUSD)} <span className="sub">{FEE_DISPLAY_PCT}</span>
        </span>
      </div>
      <div className="fee-row">
        <span className="fee-label">
          {gasLabel}{" "}
          <span className="info-i" title="Estimated network and relayer cost at current conditions">
            i
          </span>
        </span>
        <span className="fee-val muted">{fmtUSD(gasUSD)}</span>
      </div>
      <div className="fee-row price-imp">
        <span className="fee-label">
          {paramText}
          <span className="info-i" title="Reflected directly in the output amount">
            i
          </span>
        </span>
        <span className="fee-val">
          <span className="pulse-dot" style={{ width: 5, height: 5 }} />
          Baked in
        </span>
      </div>
      <div className="fee-row total">
        <span className="fee-label">Total cost</span>
        <span className="fee-val">{fmtUSD(totalUSD)}</span>
      </div>
    </div>
  );
}
