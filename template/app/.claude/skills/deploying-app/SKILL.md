---
name: deploying-app
description: deploy the Wasp app to Railway or Fly.io using Wasp CLI.
---

# deploying-app

## Pre-Deployment

1. Run a pre-deployment check via [validating-pre-deployment](./validating-pre-deployment.md) to validate configuration.
2. present the list of supported `wasp deploy` providers under the "Wasp Deploy" section of the docs and ask the user to choose one.
3. follow the steps from the chosen provider's guide to deploy the app.

## OAuth Redirect URLs

If they user is using OAuth providers, inform them that they need to add the redirect URLs to the OAuth providers in the provider's dashboard.
For example: https://your-server-url.com/auth/google/callback

More info can be found in the Wasp Social Auth Providers docs.

## Deployment Interrupted

Safe to rerun: `wasp deploy <provider> deploy`

**DO NOT rerun**: `wasp deploy <provider> launch` commands (one-time only)
