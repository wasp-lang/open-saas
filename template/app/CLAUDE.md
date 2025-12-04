# CLAUDE.md

## What is This Project?

This is the **Open SaaS template** - a free, open-source SaaS starter boilerplate built on the Wasp framework. Users get this template when they run `wasp new -t saas` and customize it to build their own SaaS applications.

**This template comes with production-ready features:**
- **Authentication** - Email verification + OAuth (Google, GitHub, Discord, Slack)
- **Payments** - Stripe, Polar.sh, and Lemon Squeezy integration with subscription management
- **Admin Dashboard** - User management and analytics
- **Email** - SendGrid, Mailgun, or SMTP support
- **File Uploads** - AWS S3 integration
- **Analytics** - Plausible or Google Analytics
- **AI Ready** - Example OpenAI integration with function calling
- **Demo App** - Example task management app to demonstrate features
- **Testing** - Playwright E2E tests included
- **Deployment** - One-command deploy to Railway or Fly.io

## New Project Detection

On first interaction, check if this is an unconfigured Open SaaS project by reading `main.wasp` (or `main.wasp.ts`). If `app.title` is still "My Open SaaS App" or contains placeholder values like "your-saas-app.com", suggest:

> "It looks like you haven't customized your Open SaaS project yet. Would you like me to run the setup wizard to configure your app? Just say 'yes' or run `/open-saas-setup-wizard`."

## Project Structure

This is a Wasp application. Wasp uses a declarative configuration file to generate a full-stack app:

- **`main.wasp`** - App configuration defining routes, pages, auth, operations, and more
  - note: users can also use `main.wasp.ts` instead of `main.wasp` for TypeScript support.
- **`schema.prisma`** - Prisma database schema (defines data models)
- **`src/{featureName}/`** - Application code organized by feature:
  - `operations.ts` - Wasp queries and actions
  - `{FeatureName}Page.tsx` - Page components
  - Components, utilities, and types as needed
- **`src/client/components/ui`** - predefined ShadCN UI components
- **`src/shared/`** - Code shared between client and server
- **`e2e-tests/`** - Playwright end-to-end tests

**Note:** The demo app features (`demo-ai-app`, `file-upload`, etc.) are examples users can reference and remove when building their own SaaS.

## Essential Commands

```bash
# Development
wasp start              # Start dev server (runs DB, server, and client)
wasp start db           # Start only the managed development database
wasp db migrate-dev     # Create and apply database migrations
wasp db studio          # Open Prisma Studio to inspect database
wasp db seed            # Run seed functions defined in main.wasp

# Production
wasp build              # Generate production build
wasp build start        # Generate production build and start server to test locally
wasp deploy             # Deploy to Railway or Fly.io

# Maintenance
wasp clean              # Delete generated code and caches (fixes most issues)
```

## Import Conventions (CRITICAL)

**In TypeScript/TSX files (`.ts`/`.tsx`):**
- ✅ Wasp imports: `import { User } from 'wasp/entities'`
- ✅ Wasp operations: `import { useQuery } from 'wasp/client/operations'`
- ✅ Wasp types: `import type { GetTasks } from 'wasp/server/operations'`
- ✅ Prisma enum values: `import { SubscriptionStatus } from '@prisma/client'`
- ✅ Local code: Use relative paths like `import { Component } from './Component'`
- ❌ NEVER use `@wasp/...` prefix
- ❌ NEVER use `@src/...` in TypeScript files

**In main.wasp file:**
- ✅ Your code: `fn: import { getTasks } from "@src/tasks/operations.ts"`
- ❌ NEVER use relative paths like `"../src/..."`

## Wasp Operations Pattern

Wasp operations (queries and actions) are the primary way to communicate between client and server.

## Database Workflow

1. Edit `schema.prisma` to add/modify models
2. Run `wasp db migrate-dev --name describe-change`
3. Wasp auto-generates TypeScript types in `wasp/entities`
4. Access via `context.entities.ModelName` in operations

**Useful commands:**
```bash
wasp db studio          # GUI to inspect database
wasp db reset           # Reset database (WARNING: deletes data)
```

## Development Patterns

Wasp abstracts and adds layers on top of the tools it uses to make development more productive. The codebase is your source of truth for how to use Wasp effectively. 

### Feature Organization

Use the current features as a guide to understand how code is organized.
When adding new features, refer to [adding-feature SKILL.md](../.claude/skills/adding-feature/SKILL.md) for more information.

## Troubleshooting

**Nuclear option (fixes most issues):**
```bash
wasp clean && wasp start
```

**Restart TypeScript server:** `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"

### Import Errors
- `"Cannot find module 'wasp/...'"` → Use `wasp/`, not `@wasp/`
- `"Cannot find module '@src/...'"` in TypeScript → Use relative paths, `@src/` is only for main.wasp

### Entity/Operation Errors
- `"context.entities.X is undefined"` → Check entity is in `entities: [...]` array in main.wasp
- Types not updating → Restart Wasp server, then restart TS server

### Database Issues
- Schema changes not applied → `wasp db migrate-dev --name describe-change`
- Database out of sync → `wasp db reset` (WARNING: deletes data)

### Runtime Errors
- 401 errors → Check `if (!context.user)` guard or `authRequired: true` on page
- DB connection issues → Run `wasp start db` or check `DATABASE_URL`
- Env var changes not working → Restart server after `.env.server` changes

## Authentication Quick Reference

**Email auth** is enabled by default. For production, switch from `Dummy` to a real email provider.

**Dev testing:** Set `SKIP_EMAIL_VERIFICATION_IN_DEV=true` or find verification URLs in server console.

## E2E Testing

With the Wasp app running in a separate terminal, run the following commands:
```bash
cd e2e-tests && npm install    # First time only
npm run local:e2e:start        # Run tests (opens Playwright UI)
```

## Wasp Discord

- https://discord.gg/aCamt5wCpS (use #🙋questions channel)

## LLM-optimized Documentation

If needed, ground yourself using the Wasp & Open SaaS documentation:
- https://wasp.sh/llms.txt
- https://docs.opensaas.sh/llms.txt

## MCP Documentation Lookup
- For specific lookups: Use `mcp__wasp-docs__find_docs` to search Wasp/OpenSaaS docs
