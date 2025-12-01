# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

**Documentation:**
- Open SaaS Docs: https://docs.opensaas.sh
- LLM-optimized: https://docs.opensaas.sh/llms-full.txt
- Wasp Docs: https://wasp.sh/docs
- Wasp LLM-optimized: https://wasp.sh/llms-full.txt

## Project Structure

This is a Wasp application. Wasp uses a declarative configuration file to generate a full-stack app:

- **`main.wasp`** - App configuration defining routes, pages, auth, operations, and more
  - note: users can also use `main.wasp.ts` instead of `main.wasp` for TypeScript support.
- **`schema.prisma`** - Prisma database schema (defines data models)
- **`src/`** - Application code organized by feature:
  - `src/auth/` - Authentication logic and pages
  - `src/client/` - Shared client components and layout
  - `src/payment/` - Stripe/Lemon Squeezy integration
  - `src/user/` - User profile and settings
  - `src/demo-ai-app/` - Example OpenAI integration (demo feature)
  - `src/file-upload/` - AWS S3 file upload example (demo feature)
  - `src/landing-page/` - Marketing landing page components
  - `src/admin/` - Admin dashboard
  - `src/server/` - Server utilities and scripts
  - `src/shared/` - Code shared between client and server

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

Refer to the following skills for more information:
- [operations.md](../.claude/skills/adding-feature/operations.md)

## Database Workflow

refer to the following skills: 
- [database.md](../.claude/skills/adding-feature/database.md)
- [starting-wasp SKILL.md](../.claude/skills/starting-wasp/SKILL.md)
- [migrating-db SKILL.md](../.claude/skills/migrating-db/SKILL.md)

## Development Patterns

### Feature Organization
Refer to [adding-feature SKILL.md](../.claude/skills/adding-feature/SKILL.md) for more information.

### AI-Assisted Development

This template includes Cursor rules in `.cursor/rules/` to help AI assistants understand Wasp and Open SaaS conventions:
- `wasp-overview.mdc` - Wasp framework fundamentals and Open SaaS overview
- `project-conventions.mdc` - Import rules and common patterns
- `database-operations.mdc` - Database and operations patterns
- `authentication.mdc` - Auth setup and customization
- `ui-components.mdc` - ShadCN UI component usage
- `deployment.mdc` - Production deployment guides
- `advanced-troubleshooting.mdc` - Custom API endpoints, background jobs

## Common Issues & Solutions

**"Cannot find module 'wasp/...'"**
- Check import prefix is `wasp/`, not `@wasp/`
- Restart Wasp dev server: `wasp clean && wasp start`

**"Cannot find module '@src/...'" in TypeScript**
- Use relative imports in `.ts`/`.tsx` files
- Only use `@src/...` in `main.wasp` file

**Type errors after changing operations**
- Restart Wasp dev server to regenerate types
- Check that entities are listed in operation definitions in `main.wasp`

## Customizing This Template

When building your SaaS app with this template:

1. **Configure branding:** Update `main.wasp` with your app name, title, description, and metadata
2. **Choose auth methods:** Enable/disable OAuth providers in `main.wasp` auth section
3. **Set up payments:** Configure Stripe, Polar.sh or Lemon Squeezy (see https://docs.opensaas.sh/guides/payment-integrations/)
4. **Customize landing page:** Edit components in `src/landing-page/`
5. **Reference demo features:** Demo app code shows how to use the features of the template (`demo-ai-app`, example tasks, etc.)
6. **Add your data models:** Define your entities in `schema.prisma`
7. **Build your features:** Create your own pages, operations, and components in `src/`
8. **Configure services:** Set up email, analytics, file storage in `.env.server`
9. **Update tests:** Modify e2e tests to match your features
10. **Deploy:** Run `wasp deploy` when ready for production

Reference the skills in [.claude/skills/](../.claude/skills/) for more information.

## Getting Help

**Wasp Discord:** https://discord.gg/aCamt5wCpS (use #🙋questions channel)

**Documentation:**
- Open SaaS Docs: https://docs.opensaas.sh
- LLM-optimized: https://docs.opensaas.sh/llms-full.txt
- Wasp Docs: https://wasp.sh/docs
- Wasp LLM-optimized: https://wasp.sh/llms-full.txt