---
name: debugging-wasp
description: diagnose and fix common Wasp development issues in Open SaaS.
---

# debugging-wasp

## Diagnostic Workflow

1. identify error type from message
2. run appropriate diagnostics
3. apply fix
4. verify fix worked

## Quick Fixes

**Nuclear option (fixes most issues):**
```bash
cd app && wasp clean && wasp start
```

**Restart TypeScript server:** Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

## Wasp-Specific Issues

### Import Errors

Import conventions are documented in project CLAUDE.md. Key points:
- TypeScript files: use `wasp/...` (not `@wasp/`)
- TypeScript files: use relative paths (not `@src/`)
- main.wasp: use `@src/...` paths

After fixing imports, re-run `wasp start`.

### Entity/Operation Errors

**"context.entities.EntityName is undefined":**
1. verify entity exists in `schema.prisma`
2. check entity is in operation's `entities: [...]` array in `main.wasp`
3. restart Wasp server

**Types not updating after adding operation:**
1. restart Wasp server to regenerate types
2. restart TypeScript server in IDE

### Database Issues

**Schema changes not applied:**
```bash
wasp db migrate-dev --name describe-change
```

**Inspect database state:**
```bash
wasp db studio
```

**Database out of sync (WARNING: deletes data):**
```bash
wasp db reset
```

### Runtime Errors

**401 errors:** verify `if (!context.user)` guard or `authRequired: true` in page

**Database connection:** run `wasp start db` or check `DATABASE_URL` in `.env.server`

**Environment variables:** check `.env.server`, restart server after changes

## Troubleshooting

see [troubleshooting](./troubleshooting.md) for specific issues

## Documentation

Fetch full text documentation directly:
- https://wasp.sh/llms-full.txt
- https://docs.opensaas.sh/llms-full.txt

If you need more specific info, use mcp__wasp-docs__find_docs to search.
