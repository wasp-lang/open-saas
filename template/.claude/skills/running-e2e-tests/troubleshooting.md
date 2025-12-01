# Troubleshooting E2E Tests

## Running E2E Tests

- **Email Verification:** Tests require `SKIP_EMAIL_VERIFICATION_IN_DEV=true` when starting the Wasp app, otherwise they will hang.
  - if the user doesn't want to skip email verification in dev mode, they must click the email verification link in the server console to continue the test (undesirable).
- **Stripe Webhooks:** Payment tests require Stripe CLI running with webhook forwarding.
  - if the user is not logged in to Stripe CLI, they can run `stripe login` to login.
  - it the api key is expired, inform the user to quit the process, and run `stripe login` again to refresh the keys.
- **Other Payment Provider Webhooks:** Payment tests require the payment provider's webhook listener running with webhook forwarding via Ngrok. See [llms.txt](https://docs.opensaas.sh/llms.txt) for the provider specific guide URL.
- **Database:** Tests use the development database, so ensure `wasp db start` is running.