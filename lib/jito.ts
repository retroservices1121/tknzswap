import bs58 from "bs58";

// Jito Block Engine — Mainnet. Public, no API key required.
// Docs: https://jito-labs.gitbook.io/mev/searcher-resources/block-engine/searcher-api
const JITO_BLOCK_ENGINE = "https://mainnet.block-engine.jito.wtf/api/v1/bundles";

interface JitoRpcResponse<T> {
  jsonrpc: "2.0";
  id: number | string;
  result?: T;
  error?: { code: number; message: string };
}

export type BundleStatus = "Landed" | "Pending" | "Failed" | "Invalid";

export interface BundleStatusEntry {
  bundle_id: string;
  transactions: string[];
  slot: number | null;
  confirmation_status: "processed" | "confirmed" | "finalized" | null;
  err: { Ok: null } | { Err: unknown } | null;
}

// Submit a single signed VersionedTransaction as a Jito bundle.
// Returns the bundle UUID. The first signature of the tx is the canonical txid.
export async function sendJitoBundle(signedTxBase58: string): Promise<string> {
  const res = await fetch(JITO_BLOCK_ENGINE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "sendBundle",
      params: [[signedTxBase58]],
    }),
  });

  if (!res.ok) {
    throw new Error(`Jito Block Engine HTTP ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as JitoRpcResponse<string>;
  if (data.error) {
    throw new Error(`Jito sendBundle rejected: ${data.error.message}`);
  }
  if (!data.result) {
    throw new Error("Jito sendBundle returned no bundle id");
  }
  return data.result;
}

export async function getBundleStatuses(bundleIds: string[]): Promise<BundleStatusEntry[]> {
  const res = await fetch(JITO_BLOCK_ENGINE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getBundleStatuses",
      params: [bundleIds],
    }),
  });

  if (!res.ok) {
    throw new Error(`Jito getBundleStatuses HTTP ${res.status}`);
  }

  const data = (await res.json()) as JitoRpcResponse<{ value: BundleStatusEntry[] }>;
  if (data.error) throw new Error(`Jito getBundleStatuses: ${data.error.message}`);
  return data.result?.value ?? [];
}

export function encodeTxBase58(rawTx: Uint8Array): string {
  return bs58.encode(rawTx);
}

// Poll for bundle landing. Resolves with the txid (signature) once landed.
// Throws on terminal failure or timeout.
export async function waitForBundleLanding(
  bundleId: string,
  expectedSignature: string,
  opts: { timeoutMs?: number; pollIntervalMs?: number } = {}
): Promise<string> {
  const timeoutMs = opts.timeoutMs ?? 45_000;
  const pollIntervalMs = opts.pollIntervalMs ?? 1_500;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const statuses = await getBundleStatuses([bundleId]);
    const entry = statuses.find((s) => s.bundle_id === bundleId);

    if (entry) {
      if (entry.err && "Err" in entry.err) {
        throw new Error(`Bundle failed on chain: ${JSON.stringify(entry.err.Err)}`);
      }
      if (entry.confirmation_status === "confirmed" || entry.confirmation_status === "finalized") {
        return expectedSignature;
      }
    }

    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }

  throw new Error(`Bundle ${bundleId} did not land within ${timeoutMs}ms`);
}
