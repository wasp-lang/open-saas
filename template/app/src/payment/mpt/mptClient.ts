import { env } from "wasp/server";

/**
 * Minimal client for the MPT payment intent API.
 *
 * MPT turns a SEPA bank transfer into EURe (Monerium e-money on Gnosis Chain)
 * and forwards it to your Safe. Whether you hit Monerium's sandbox or
 * production is decided by the MPT key: a sandbox key works against
 * `api.monerium.dev`, a production key against `api.monerium.app`.
 */

export interface MptIntentMetadata {
  userId?: string;
  paymentPlanId?: string;
}

export interface MptPaymentIntent {
  sid: string;
  /** `pending`, `paid` or `expired`; see `getMptIntentSettlement`. */
  state: string;
  amount_cents: number;
  amount_received_cents: number | null;
  monerium_order_id: string | null;
  paid_at: string | null;
  metadata: MptIntentMetadata | null;
  checkout_url: string;
  status?: { stage?: string };
}

interface CreateMptPaymentIntentArgs {
  sid: string;
  amountEur: string;
  label: string;
  metadata: Required<MptIntentMetadata>;
  returnUrl: string;
}

// SEPA transfers that are not instant can take a business day, so the intent
// stays open for the maximum MPT allows.
const INTENT_TTL_SECONDS = 24 * 60 * 60;

export function createMptPaymentIntent({
  sid,
  amountEur,
  label,
  metadata,
  returnUrl,
}: CreateMptPaymentIntentArgs): Promise<MptPaymentIntent> {
  return mptRequest("/api/intents", {
    method: "POST",
    body: JSON.stringify({
      sid,
      target_address: env.MPT_TARGET_ADDRESS,
      amount_eur: amountEur,
      label,
      metadata,
      return_url: returnUrl,
      expires_in_seconds: INTENT_TTL_SECONDS,
    }),
  });
}

export function getMptPaymentIntent(sid: string): Promise<MptPaymentIntent> {
  return mptRequest(`/api/intents/${encodeURIComponent(sid)}`, {
    method: "GET",
  });
}

interface MptIntentTotals {
  count: number;
  amount_cents: number;
  amount_received_cents: number;
}

/** Totals per intent outcome, across all of the tenant's intents. */
export interface MptIntentStats {
  currency: string;
  paid: MptIntentTotals;
  late: MptIntentTotals;
  underpaid: MptIntentTotals;
  pending: MptIntentTotals;
  expired: MptIntentTotals;
}

export function getMptIntentStats(): Promise<MptIntentStats> {
  return mptRequest("/api/intents/stats", { method: "GET" });
}

async function mptRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(new URL(path, env.MPT_API_URL), {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.MPT_SECRET_KEY}`,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `MPT request ${init.method} ${path} failed with status ${response.status}: ${body}`,
    );
  }

  return (await response.json()) as T;
}

export type MptIntentSettlement = "paid" | "late" | "pending" | "failed";

/**
 * What an intent means for the buyer. `late` is a full payment that arrived
 * after the intent expired, so it counts as paid too.
 */
export function getMptIntentSettlement(
  intent: MptPaymentIntent,
): MptIntentSettlement {
  if (intent.state === "paid") {
    return "paid";
  }
  if (intent.status?.stage === "rejected") {
    return "failed";
  }
  const isUnderpaid =
    intent.amount_received_cents !== null &&
    intent.amount_received_cents < intent.amount_cents;
  if (intent.state === "expired") {
    const isPaidInFull =
      intent.paid_at !== null &&
      intent.amount_received_cents !== null &&
      !isUnderpaid;
    return isPaidInFull ? "late" : "failed";
  }
  // MPT leaves an underpaid intent open for the merchant to decide; Open SaaS
  // grants nothing for it.
  return isUnderpaid ? "failed" : "pending";
}
