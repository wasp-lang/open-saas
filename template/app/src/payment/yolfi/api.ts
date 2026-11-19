import { HttpError, env } from "wasp/server";

export interface YolfiSession {
  id: string;
  object: "checkout_session";
  status: "OPEN" | "PROCESSING" | "COMPLETED" | "EXPIRED";
  amount: string;
  currency: string;
  merchantOrderId: string;
  clientReferenceId?: string;
  metadata?: Record<string, unknown>;
  url: string;
}

export const isSessionId = (value: unknown): value is string =>
  typeof value === "string" && /^ycs_[A-Za-z0-9_-]{1,128}$/.test(value);

export const isUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

/** Source-pricing USD cents only. Never use this to interpret token amounts. */
export function usdCents(value: unknown): bigint {
  if (
    typeof value !== "string" ||
    !/^(0|[1-9]\d{0,11})(\.\d{1,18})?$/.test(value)
  ) {
    throw new HttpError(409, "Invalid Yolfi source price");
  }
  const [whole, fraction = ""] = value.split(".");
  if (/[^0]/.test(fraction.slice(2))) {
    throw new HttpError(409, "Invalid Yolfi source precision");
  }
  return BigInt(whole) * 100n + BigInt((fraction + "00").slice(0, 2));
}

export function hostedUrl(value: unknown): string {
  try {
    const url = new URL(String(value));
    if (
      url.protocol === "https:" &&
      url.hostname === "pay.yolfi.com" &&
      !url.username &&
      !url.password &&
      !url.port
    ) {
      return url.toString();
    }
  } catch {
    /* Return only a generic integration error. */
  }
  throw new HttpError(502, "Invalid Yolfi hosted checkout URL");
}

/** Two bounded attempts; POST retries reuse the exact logical order/body/key. */
async function requestSession(
  path: string,
  body?: Record<string, unknown>,
  idempotencyKey?: string,
): Promise<YolfiSession> {
  if (!env.YOLFI_API_KEY) {
    throw new HttpError(503, "Yolfi API configuration is required");
  }
  const headers = new Headers({ "Content-Type": "application/json" });
  headers.set("Authorization", ["Bearer", env.YOLFI_API_KEY].join(" "));
  if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey);
  const encodedBody = body ? JSON.stringify(body) : undefined;
  for (let attempt = 0; attempt < 2; attempt++) {
    let response: Response;
    let raw: string;
    try {
      response = await fetch(
        `https://app.yolfi.com/api/checkout-sessions${path}`,
        {
          method: body ? "POST" : "GET",
          headers,
          body: encodedBody,
          signal: AbortSignal.timeout(10_000),
          redirect: "error",
        },
      );
      if (!response.ok) {
        if (
          attempt === 0 &&
          (response.status === 429 || response.status >= 500)
        )
          continue;
        throw new HttpError(502, "Yolfi checkout request failed");
      }
      raw = await response.text();
    } catch (error) {
      if (error instanceof HttpError) throw error;
      if (attempt === 0) continue;
      throw new HttpError(502, "Yolfi checkout request timed out or failed");
    }
    try {
      if (raw.length > 65_536) throw new Error("Oversized response");
      const result = JSON.parse(raw);
      const data = result?.data;
      if (
        result?.success !== true ||
        !data ||
        !isSessionId(data.id) ||
        data.object !== "checkout_session" ||
        !["OPEN", "PROCESSING", "COMPLETED", "EXPIRED"].includes(data.status) ||
        typeof data.amount !== "string" ||
        typeof data.currency !== "string" ||
        typeof data.merchantOrderId !== "string"
      ) {
        throw new Error("Invalid response shape");
      }
      return data as YolfiSession;
    } catch {
      throw new HttpError(502, "Invalid Yolfi checkout response");
    }
  }
  throw new HttpError(502, "Yolfi checkout request failed");
}

export function createYolfiSession(
  body: Record<string, unknown>,
  idempotencyKey: string,
) {
  return requestSession("", body, idempotencyKey);
}

export function retrieveYolfiSession(id: string) {
  if (!isSessionId(id))
    throw new HttpError(400, "Invalid Yolfi checkout reference");
  return requestSession(`/${encodeURIComponent(id)}`);
}
