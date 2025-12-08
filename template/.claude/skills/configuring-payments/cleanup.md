# Cleanup Unused Providers

Optional cleanup after selecting payment provider.

## Remove Unused Provider Directories

Delete code for providers you're not using (e.g., `stripe/`, `lemonsqueezy/`, `polar/`) in the following directories:
- `app/src/payment/<unused-provider>/`
- `app/src/payment/paymentProcessor.ts`
- `app/src/server/scripts/dbSeeds.ts`
- `app/src/analytics/stats.ts`

## Environment Variables

Remove unused provider variables from `.env.server`.

## Schema (Lemon Squeezy only)

If not using Lemon Squeezy, remove `lemonSqueezyCustomerPortalUrl` from User model in schema.prisma, then run `wasp db migrate-dev`.

## Verify

Run `wasp clean && wasp start`, test payment flow.
