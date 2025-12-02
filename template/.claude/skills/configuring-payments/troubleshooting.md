# Troubleshooting - Payments

## Webhooks Not Working

**Stripe:** verify `stripe listen` running, secret matches CLI output

**Lemon Squeezy / Polar:** verify ngrok running, URL includes `/payments-webhook`, secret matches

**ngrok expired:** restart ngrok, update webhook URL in dashboard

## Product IDs

ID format varies by provider:
- Stripe: `price_...`
- Lemon Squeezy: `variant_...`
- Polar: product IDs

Ensure products active in dashboard, IDs correct in `.env.server`.

## Subscription Not Updating

Check webhook events enabled:
- Lemon Squeezy: `order_created`, `subscription_*`
- Polar: `order.paid`, `subscription.updated`

## Test Payments

**Stripe:** card `4242 4242 4242 4242`, API key starts with `sk_test_`

**Polar:** set `POLAR_SANDBOX_MODE=true`

## More Help

See [Open SaaS payment docs](https://docs.opensaas.sh/llms.txt)
