# CLAUDE.md

## What is Open SaaS?

Open SaaS is a free, open-source SaaS starter built on Wasp (React + Node.js + Prisma). It includes auth, payments, admin dashboard, email, file uploads, and analytics out of the box. Users customize this template to build their own SaaS applications.

**Tech stack:** Wasp, React, TypeScript, Node.js, Prisma, PostgreSQL, TailwindCSS, ShadCN UI

## Critical Files

Read these first to understand the app:

- [main.wasp](main.wasp) - App config: routes, pages, auth, operations, jobs
  - note: users can also use `main.wasp.ts` instead of `main.wasp`
- [schema.prisma](schema.prisma) - Database models and relationships
- [src/payment/](src/payment/) - Payment processor integration & great example of Wasp's feature set in action.
- [src/auth/](src/auth/) - Authentication logic and pages

## Commands

```bash
# Development
wasp start              # Start dev server (DB + server + client)
wasp start db           # Start only the database
wasp db migrate-dev     # Apply schema changes
wasp db studio          # Inspect database GUI

# Production
wasp build              # Generate production build
wasp deploy             # Deploy to Railway or Fly.io

# Maintenance
wasp clean              # Delete generated code (fixes most issues)
```

## Project Structure

```
src/
├── {feature}/          # Feature modules (auth, payment, user, admin, etc.)
│   ├── operations.ts   # Wasp queries and actions
│   └── *Page.tsx       # Page components
├── client/components/  # Shared UI components (ShadCN)
└── shared/             # Code shared between client and server
```

Features are organized by domain. Use existing features as patterns when adding new ones.

## Coding Standards

- **Comment the "why", not the "what"** - Explain non-obvious decisions and edge cases
- Use descriptive names over comments where possible
- Follow existing patterns in the codebase

## Import Conventions (Critical)

**In TypeScript files:**
- ✅ `import type { User } from 'wasp/entities'`
- ✅ `import type { GetTasks } from 'wasp/server/operations'`
- ✅ `import { getTasks,useQuery } from 'wasp/client/operations'`
- ✅ `import { SubscriptionStatus } from '@prisma/client'`
- ✅ Local code: relative paths `import { X } from './X'`
- ❌ Never `@wasp/...` or `@src/...`
- ⚠️ Call actions directly using `async/await`. DO NOT use Wasp's `useAction` hook unless optimistic updates are needed.

**In main.wasp:**
- ✅ `fn: import { getTasks } from "@src/tasks/operations.ts"`
- ❌ Never relative paths

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Cannot find module 'wasp/...'` | Use `wasp/`, not `@wasp/` |
| `Cannot find module '@src/...'` in TS | Use relative paths; `@src/` is only for main.wasp |
| `context.entities.X undefined` | Add entity to `entities: [...]` in main.wasp |
| Types not updating | Restart Wasp server, then TS server |
| Schema changes not applied | `wasp db migrate-dev --name change-name` |
| General weirdness | `wasp clean && wasp start` |

## Resources

**Help:** https://discord.gg/aCamt5wCpS (#🙋questions channel)

**MCP Tools:** Use `mcp__wasp-docs` to search Wasp/OpenSaaS docs

**Documentation:**
- https://wasp.sh/llms.txt
- https://docs.opensaas.sh/llms.txt
