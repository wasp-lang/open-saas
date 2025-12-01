# Troubleshooting - Adding Features

## Type Errors After Adding Operations

Run `cd app && wasp clean && wasp start` to regenerate types.

## "Cannot find module 'wasp/...'"

Use `wasp/` prefix, NOT `@wasp/`. Example: `import { User } from 'wasp/entities'`

## Entity Not Found in Context

Add entity to operation's `entities` array in `main.wasp`:
```wasp
query getItems {
  fn: import { getItems } from "@src/feature-name/operations",
  entities: [EntityName]  // ← Must list all entities used
}
```

## Migration Fails

- check `schema.prisma` syntax is valid
- ensure PostgreSQL is running (`wasp start db` if using managed DB)
- delete failed migration in `app/migrations/` directory and retry

## 401 Unauthorized Errors

- verify page has `authRequired: true` in `main.wasp`
- ensure testing on `localhost:3000` (correct port)
- check cookies are enabled in browser

## Page Not Found (404)

- verify route is defined in `main.wasp`
- check path matches what you're navigating to
- restart Wasp dev server

## Data Not Updating in UI

- queries auto-refetch after actions complete
- check browser console for errors
- verify action completed successfully (no errors thrown)
