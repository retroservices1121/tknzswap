import { fmtUSD } from "@/lib/format";
import { LIFI_FEE_FLOAT, FEE_DISPLAY_PCT } from "@/lib/fee";
import type { UnifiedRoute } from "@/types/route";

interface Props {
  isSol: boolean;
  route: UnifiedRoute;
}

export function FeeDisclosure({ isSol, route }: Props) {
  const feeUSD = route.fromAmountUSD * LIFI_FEE_FLOAT;
  const gasUSD = route.gasCostUSD;
  const totalUSD = feeUSD + gasUSD;

  const paramText = isSol ? (
    <>
      <span className="brand-dflow">DFlow</span> price improvement
    </>
  ) : (
    <>
      <span className="brand-lifi">Li.Fi</span> route optimization
    </>
  );

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
          Network gas{" "}
          <span className="info-i" title="Estimated network gas at current conditions">
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
