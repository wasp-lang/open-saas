# Troubleshooting - Deployment

## Client Env Vars Not Working

Must be prefixed `REACT_APP_` and provided on EVERY deploy:
```bash
REACT_APP_X=val wasp deploy railway deploy my-app
```

## Deployment Interrupted

Safe to rerun: `wasp deploy railway deploy` or `wasp deploy fly deploy`

Do NOT rerun: `launch` commands (one-time only)

## Add Server Secrets After Launch

**Railway:** set in dashboard (Service > Variables) or rerun with `--server-secret`

**Fly.io:** `wasp deploy fly cmd secrets set KEY=value --context=server`

## Name Already Taken

Railway names unique per account. Fly.io names globally unique.

## Build Failures

Test locally first: `wasp build`

## Database Issues

Both platforms auto-configure `DATABASE_URL`. Check database service is running in dashboard/status.

## More Help

See [Wasp deployment docs](https://wasp.sh/llms.txt)
