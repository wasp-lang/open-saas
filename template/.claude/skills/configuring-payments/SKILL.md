---
name: configuring-payments
description: configure payment integration for Open SaaS (Stripe, Lemon Squeezy, or Polar).
---

# configuring-payments

All payment integration guide URLs, including provider-specific guide URLs, are available in the [Open SaaS LLM-optimized documentation](https://docs.opensaas.sh/llms.txt)

## Setup Methods

**Automated Stripe Setup via CLI:** For faster Stripe setup via command line, see [stripe-automated-setup.md](./stripe-automated-setup.md)

**Manual Setup:** Follow steps below for any provider.

## Manual Setup Steps

### 1. Select Provider

In [`../../../app/src/payment/paymentProcessor.ts`](../../../app/src/payment/paymentProcessor.ts), uncomment chosen provider, comment out others.

### 2. Environment Variables

Set in `.env.server`:

| Provider | Variables |
|----------|-----------|
| Stripe | `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Lemon Squeezy | `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_WEBHOOK_SECRET` |
| Polar | `POLAR_ORGANIZATION_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_SANDBOX_MODE=true` |

### 3. Create Products

Create in provider dashboard: 2 subscriptions (Hobby, Pro) + 1 one-time (Credits).

Set IDs in `.env.server`:
```
PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID=...
PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID=...
PAYMENTS_CREDITS_10_PLAN_ID=...
```

Update `src/payment/plans.ts` if changing product names.

### 4. Configure Webhooks

**Stripe:** `stripe listen --forward-to localhost:3001/payments-webhook`

**Lemon Squeezy / Polar:** use ngrok (`ngrok http 3001`), set webhook URL to `https://[ngrok-url]/payments-webhook`

## Testing Payments and Troubleshooting

See [troubleshooting](./troubleshooting.md)

## Cleanup

See [cleanup.md](./cleanup.md) to remove unused provider code.

