---
name: deploying-app
description: deploy the Open SaaS app to Railway or Fly.io using Wasp CLI.
---

# deploying-app

All deployment guide URLs, including provider-specific guide URLs, are available in the [Wasp LLM-optimized documentation](https://wasp.sh/llms.txt)

## Pre-Deployment

1. confirm platform: Railway or Fly.io
2. verify CLI installed and logged in:
   - Railway: `railway whoami`
   - Fly.io: `fly auth whoami`
3. collect env vars: server secrets + client vars (prefixed `REACT_APP_`)

## Deploy Commands

| Platform | First Time | Subsequent |
|----------|------------|------------|
| Railway | `wasp deploy railway launch <name> --server-secret KEY=val` | `REACT_APP_X=val wasp deploy railway deploy <name>` |
| Fly.io | `wasp deploy fly launch <name> <region> --server-secret KEY=val` | `REACT_APP_X=val wasp deploy fly deploy` |

**Critical:**
- `launch` runs ONCE only
- Client vars required on EVERY deploy
- Don't interrupt deployment

## Verify

- Check logs: Railway dashboard, `wasp deploy railway variables` or `wasp deploy fly cmd logs --context=server`
- Test deployed URL

## Troubleshooting

See [troubleshooting](./troubleshooting.md)
