---
name: deploying-app
description: deploy the Open SaaS app to Railway or Fly.io using Wasp CLI.
---

# deploying-app

## Pre-Deployment

1. Run the [validating-pre-deployment skill](../validating-pre-deployment/SKILL.md) first to validate configuration.
2. confirm platform: Railway or Fly.io
3. verify CLI installed and logged in:
   - Railway: `railway whoami`
   - Fly.io: `fly auth whoami`
4. collect env vars: server secrets + client vars (prefixed `REACT_APP_`)

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

## Documentation

Fetch guide URLs directly:
- https://docs.opensaas.sh/llms.txt
- https://wasp.sh/llms.txt

If you need more specific info, use mcp__wasp-docs__find_docs to search.
