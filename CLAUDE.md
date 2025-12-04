# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Open SaaS?

**Open SaaS** is a free, open-source SaaS starter template built on top of the Wasp framework. It provides a production-ready foundation for building SaaS applications with essential features already implemented:

- **Authentication** - Email verification + OAuth (Google, GitHub, Discord)
- **Payments** - Stripe and Lemon Squeezy integration with subscription management
- **Admin Dashboard** - User management and analytics
- **Email** - SendGrid, Mailgun, or SMTP support
- **File Uploads** - AWS S3 integration
- **Analytics** - Plausible or Google Analytics
- **AI Ready** - Example OpenAI integration with function calling
- **Documentation** - Astro Starlight blog and docs site
- **Testing** - Playwright E2E tests
- **Deployment** - One-command deploy to Railway or Fly.io

Open SaaS follows best practices and conventions specific to building SaaS applications on Wasp. The template is designed to be customized and extended for your specific product needs.

## Repository Structure

This is the **Open SaaS** monorepo, a full-stack SaaS template built with Wasp, React, Node.js, and Prisma.

The repository is organized into three main directories:

- **`template/`** - The core Open SaaS template distributed via `wasp new -t saas`
  - `template/app/` - The main Wasp application
  - `template/blog/` - Astro-based documentation and blog
  - `template/e2e-tests/` - Playwright end-to-end tests

- **`opensaas-sh/`** - Production deployment at https://opensaas.sh (built with Open SaaS itself)
  - `opensaas-sh/app/` - Generated via `dope.sh` from template + diffs
  - `opensaas-sh/app_diff/` - Versioned diffs applied to template
  - `opensaas-sh/blog/` - Production docs and landing page

- **`tools/`** - Development tooling including `dope.sh` for managing derived projects

### Derived Project Management

The `opensaas-sh` app is not directly versioned. Instead, only the **diffs** from the template are stored in `opensaas-sh/app_diff/`. Use `tools/dope.sh` to manage this:

```bash
# Regenerate opensaas-sh/app/ from template + diffs (after template changes):
./tools/dope.sh template/app opensaas-sh/app patch

# Update diffs after modifying opensaas-sh/app/:
./tools/dope.sh template/app opensaas-sh/app diff
```

## Working with the Wasp App

### Project Structure

Wasp uses a declarative configuration file (`main.wasp`) to generate a full-stack application:

- **`main.wasp`** - App configuration defining routes, pages, auth, operations, and more
- **`schema.prisma`** - Prisma database schema (defines entities)
- **`src/`** - Custom application code organized by feature:
  - `src/auth/` - Authentication logic and pages
  - `src/client/` - Shared client components and layout
  - `src/payment/` - Stripe/Lemon Squeezy integration
  - `src/user/` - User profile and settings
  - `src/demo-ai-app/` - Example OpenAI integration
  - `src/file-upload/` - AWS S3 file upload example
  - `src/landing-page/` - Marketing landing page components
  - `src/admin/` - Admin dashboard
  - `src/server/` - Server utilities and scripts
  - `src/shared/` - Code shared between client and server

### Essential Commands

```bash
# Development
wasp start              # Start dev server (runs DB, server, and client)
wasp start db           # Start only the managed development database
wasp db migrate-dev     # Create and apply database migrations
wasp db studio          # Open Prisma Studio to inspect database
wasp db seed            # Run seed functions defined in main.wasp

# Testing & Quality
wasp test               # Run tests
npm run prettier:check  # Check code formatting (root level)
npm run prettier:format # Format code (root level)

# Production
wasp build              # Generate production build
wasp deploy             # Deploy to Railway or Fly.io

# Maintenance
wasp clean              # Delete generated code and caches (fixes most issues)
```

### Import Conventions (CRITICAL)

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

### Wasp Operations Pattern

Wasp operations (queries and actions) are the primary way to communicate between client and server.

**Define in main.wasp:**
```wasp
query getTasks {
  fn: import { getTasks } from "@src/tasks/operations.ts",
  entities: [Task]  // Grants access to Task entity
}

action createTask {
  fn: import { createTask } from "@src/tasks/operations.ts",
  entities: [Task]
}
```

**Implement in `src/{feature}/operations.ts`:**
```typescript
import { HttpError } from 'wasp/server'
import type { GetTasks, CreateTask } from 'wasp/server/operations'
import type { Task } from 'wasp/entities'

export const getTasks: GetTasks<void, Task[]> = async (_args, context) => {
  if (!context.user) throw new HttpError(401)
  return context.entities.Task.findMany({ where: { userId: context.user.id } })
}

export const createTask: CreateTask<{ description: string }, Task> = async (args, context) => {
  if (!context.user) throw new HttpError(401)
  return context.entities.Task.create({
    data: { description: args.description, userId: context.user.id }
  })
}
```

**Use on client:**
```typescript
// Queries: use useQuery hook
import { getTasks, useQuery } from 'wasp/client/operations'
const { data: tasks, isLoading } = useQuery(getTasks)

// Actions: call directly with async/await (DO NOT use useAction unless optimistic updates needed)
import { createTask } from 'wasp/client/operations'
await createTask({ description: 'New task' })
```

### Database Workflow

1. Modify `schema.prisma` to add/change models
2. Run `wasp db migrate-dev` to generate and apply migrations
3. Wasp automatically generates TypeScript types in `wasp/entities`
4. Reference entities in operations via `context.entities.ModelName`

### AI-Assisted Development

The template includes comprehensive Cursor rules in `template/app/.cursor/rules/`:
- `wasp-overview.mdc` - Wasp framework fundamentals
- `project-conventions.mdc` - Import rules and common patterns
- `database-operations.mdc` - Database and operations patterns
- `authentication.mdc` - Auth setup and customization
- `ui-components.mdc` - ShadCN UI component usage
- `deployment.mdc` - Production deployment guides
- `advanced-troubleshooting.mdc` - Custom API endpoints, background jobs

## Tech Stack

- **Framework:** Wasp 0.19+ (React + Node.js + Prisma)
- **Frontend:** React, TypeScript, TailwindCSS, ShadCN UI
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (production) / SQLite (local dev)
- **Auth:** Email + OAuth (Google, GitHub, Discord)
- **Payments:** Stripe or Lemon Squeezy
- **Email:** SendGrid, Mailgun, or SMTP
- **Storage:** AWS S3
- **Testing:** Playwright (E2E)
- **Docs:** Astro Starlight

## Common Development Patterns

### Feature Organization
Group related code by feature in `src/{featureName}/`:
- `operations.ts` - Wasp queries and actions
- `{FeatureName}Page.tsx` - Page components
- Components, utilities, and types as needed

Group feature config in `main.wasp` using regions:
```wasp
// #region Tasks Feature
route TasksRoute { path: "/tasks", to: TasksPage }
page TasksPage { component: import { TasksPage } from "@src/tasks/TasksPage" }
query getTasks { ... }
action createTask { ... }
// #endregion
```

### Error Handling
Use `HttpError` from `wasp/server` for structured errors:
```typescript
import { HttpError } from 'wasp/server'
throw new HttpError(404, 'Resource not found')
```

### Testing
E2E tests live in `template/e2e-tests/` and use Playwright:
```bash
cd template/e2e-tests
npm install
npm run test
```

## Contributing

1. Work in the `template/` directory (changes auto-flow to derived projects)
2. Update `template/e2e-tests/` if adding/changing features
3. Update `opensaas-sh/blog/src/content/docs/` if changing documented behavior
4. Run `npm run prettier:format` before committing
5. Test changes work with `wasp clean && wasp start`

## Troubleshooting

**"Cannot find module 'wasp/...'"**
- Check import prefix is `wasp/`, not `@wasp/`
- Restart Wasp dev server: `wasp clean && wasp start`

**"Cannot find module '@src/...'" in TypeScript**
- Use relative imports in `.ts`/`.tsx` files
- Only use `@src/...` in `main.wasp` file

**Database changes not applied**
- Run `wasp db migrate-dev` after changing `schema.prisma`
- Check PostgreSQL is running if using `postgresql` provider

**Generated code out of sync**
- Run `wasp clean` to delete all generated code and caches
- Restart with `wasp start`

**macOS dope.sh errors**
- Install: `brew install coreutils gpatch diffutils`

## LLM-optimized Documentation

If needed, ground yourself using the Wasp & Open SaaS documentation:
- https://wasp.sh/llms.txt
- https://docs.opensaas.sh/llms.txt

## MCP Documentation Lookup
- For specific lookups: Use `mcp__wasp-docs__find_docs` to search Wasp/OpenSaaS docs
