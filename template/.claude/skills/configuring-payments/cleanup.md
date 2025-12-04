# Cleanup Unused Providers

Optional cleanup after selecting payment provider.

## Remove Unused Provider Directories

Delete directories in `app/src/payment/` for providers you're not using (e.g., `stripe/`, `lemonsqueezy/`, `polar/`).

## Environment Variables

Remove unused provider variables from `.env.server`.

## Schema (Lemon Squeezy only)

If not using Lemon Squeezy, remove `lemonSqueezyCustomerPortalUrl` from User model in schema.prisma, then run `wasp db migrate-dev`.

## Verify

Run `wasp clean && wasp start`, test payment flow.
