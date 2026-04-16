# Plan: Add moneydevkit as a Payment Processor Option

## Context

moneydevkit is a Bitcoin Lightning payment platform. The user wants to add it as a fourth payment processor option alongside Stripe, LemonSqueezy, and Polar in the Open SaaS project, and set it as the active provider.

**Key challenge:** moneydevkit's SDK creates checkouts via an Express router (`createMdkExpressRouter()`), but Open SaaS creates checkouts from Wasp actions (no Express context). We solve this by:
1. Mounting the MDK Express router as **Wasp per-route middleware** on a `/api/mdk` endpoint
2. In `createCheckoutSession`, making an internal `fetch()` to that endpoint

## Files to Create

### 1. `src/payment/moneydevkit/mdkApi.ts`
Wasp API handler + middleware that mounts the MDK Express router:
- `mdkApiMiddlewareConfigFn` — adds `createMdkExpressRouter()` as middleware, stripping the URL path so the router's internal routes match
- `mdkApiHandler` — fallback handler (shouldn't be reached since the middleware handles the request)
- Uses Wasp's per-route `middlewareConfigFn` pattern (documented in Wasp middleware docs)

### 2. `src/payment/moneydevkit/checkoutUtils.ts`
- `createMdkCheckoutSession()` — makes a `fetch()` POST to `${config.serverUrl}/api/mdk` with product ID, customer email, userId metadata, and success/cancel URLs
- Returns `{ url, id }` from the MDK response

### 3. `src/payment/moneydevkit/webhook.ts`
- `mdkMiddlewareConfigFn` — swaps `express.json()` for `express.raw()` (same pattern as Stripe/Polar, needed for `standardwebhooks` signature verification)
- `mdkWebhook` — verifies signatures with `standardwebhooks` using `MDK_WEBHOOK_SECRET`, then routes events:
  - `checkout.completed` → find user by `metadata.userId` (email fallback), update subscription/credits
  - `subscription.created` → store MDK `customerId` as `paymentProcessorUserId`, set subscription active
  - `subscription.renewed` → keep subscription active, update `datePaid`
  - `subscription.canceled` → set status to `Deleted` or `CancelAtPeriodEnd`
- Follows existing error handling pattern (`UnhandledWebhookEventError`)

### 4. `src/payment/moneydevkit/paymentProcessor.ts`
- Implements `PaymentProcessor` interface with `id: "moneydevkit"`
- `createCheckoutSession` — calls `createMdkCheckoutSession()` with plan's product ID
- `fetchCustomerPortalUrl` — returns `null` (Lightning payments have no customer portal)
- `fetchTotalRevenue` — returns `0` initially (can be enhanced later)

## Files to Modify

### 5. `src/payment/paymentProcessor.ts`
- Add `"moneydevkit"` to the `id` union type
- Add import for `moneydevkitPaymentProcessor`
- Set it as the active provider (comment out Stripe)

### 6. `main.wasp`
Add API endpoint with per-route middleware for the MDK Express router:
```wasp
api mdkApi {
  fn: import { mdkApiHandler } from "@src/payment/moneydevkit/mdkApi",
  middlewareConfigFn: import { mdkApiMiddlewareConfigFn } from "@src/payment/moneydevkit/mdkApi",
  httpRoute: (POST, "/api/mdk"),
  auth: false
}
```

### 7. `package.json`
- Add `@moneydevkit/replit` and `standardwebhooks`

### 8. `.env.server.example`
- Add `MDK_ACCESS_TOKEN`, `MDK_MNEMONIC`, `MDK_WEBHOOK_SECRET`

## Key Design Decisions

**Middleware-based router mounting:** The MDK Express router is mounted as Wasp per-route middleware on `/api/mdk`. The middleware strips the URL path prefix so the router's internal route handlers match. This is the idiomatic Wasp way to integrate Express routers. No internal shared secret needed — the MDK router validates via `MDK_ACCESS_TOKEN`.

**Self-call for checkout creation:** `createCheckoutSession` (Wasp action) makes a `fetch()` POST to `${config.serverUrl}/api/mdk`. This is a localhost call with sub-millisecond latency. The server is always up when users click "Buy".

**User mapping in webhooks:** `checkout.completed` identifies users via `metadata.userId` passed during checkout (email fallback). `subscription.created` provides the MDK `customerId` which gets stored as `paymentProcessorUserId` for subsequent events.

**No customer portal:** Returns `null`. The UI already handles this gracefully.

**Revenue tracking:** Starts as `return 0`. Can be enhanced later.

## Implementation Order

1. Install dependencies (`npm install @moneydevkit/replit standardwebhooks`)
2. Inspect MDK SDK source to confirm Express router request/response format
3. Create `mdkApi.ts` (middleware + handler)
4. Create `checkoutUtils.ts`
5. Create `webhook.ts`
6. Create `paymentProcessor.ts`
7. Update `src/payment/paymentProcessor.ts` (interface + active provider)
8. Update `main.wasp` (add API endpoint)
9. Update `.env.server.example`

## Verification

1. Inspect SDK exports after install
2. Test checkout flow: Buy → redirect to MDK checkout → complete → webhook → user updated
3. Test webhook handling with all 4 event types
4. Verify PricingPage works with null customer portal URL
