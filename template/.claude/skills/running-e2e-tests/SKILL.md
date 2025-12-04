---
name: running-e2e-tests
description: run Playwright end-to-end tests for the Open SaaS app.
---

# running-e2e-tests

## Running E2E Tests

1. check if the user is in the correct directory by verifying [`./e2e-tests/package.json`](../../../e2e-tests/package.json) exists.
2. check if dependencies are installed by verifying [`./e2e-tests/node_modules`](../../../e2e-tests/node_modules) exists.
3. if not installed, run `cd e2e-tests && npm install`.
4. check if the Wasp app is running by checking if localhost:3000 and localhost:3001 are accessible.
5. if not running, inform the user they need to start the app first with `wasp start` in a separate terminal with `SKIP_EMAIL_VERIFICATION_IN_DEV=true` environment variable set.
6. check if Stripe CLI is needed by asking the user if they want to test payment flows.
7. if Stripe is needed:
   - check if Stripe CLI is installed by running `stripe --version`.
   - if not installed, provide instructions: https://docs.stripe.com/stripe-cli
   - check to make sure the user is logged in to Stripe CLI by running `stripe login`.
8. run the tests with `npm run local:e2e:start`.
9. inform the user that the playwright UI will open and allow them to select and run tests. 

## Troubleshooting

see [troubleshooting](../troubleshooting.md)

## Documentation

Fetch guide URLs directly:
- https://docs.opensaas.sh/llms.txt

If you need more specific info, use mcp__wasp-docs__find_docs to search.
