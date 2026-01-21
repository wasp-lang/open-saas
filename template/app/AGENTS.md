# Open SaaS

This is SaaS starter boilerplate template built on top of Wasp, a batteries-included framework for building full-stack web apps with React, Node.js, and Prisma.

## Development Guidelines

### Documentation

Always fetch and verify your knowledge against the current Wasp documentation before taking on tasks, answering questions, or doing any development work in a Wasp project as your Wasp knowledge may be outdated:
1. Run `wasp version` to get the current Wasp CLI version.
2. Find and fetch the correct version of the Wasp documentation maps from the [LLMs.txt index](https://wasp.sh/llms.txt). The map contains raw markdown file GitHub URLs of all documentation sections.
3. Fetch the guides relevant to the current task or query from those raw.githubusercontent.com URLs directly - do NOT use HTML page URLs.

To fetch (integration) guides for the specific features of this SaaS template, such as payment providers, file uploads, SEO, and deployments, use the [Open SaaS Docs - LLMs.txt](https://docs.opensaas.sh/llms.txt) index.

### Start a Wasp Development Session with Full Debugging Visibility

Run the [`start-dev-server` skill](.claude/skills/start-dev-server/SKILL.md) with the recommended options if possible to give the Agent full debugging visibility.

### Database Schema and Migrations

Always run database migrations with the `--name` flag:
```bash
wasp db migrate-dev --name <descriptive-name>
```

Changes to `schema.prisma` are not applied until database migrations are run. 

**Track pending migrations:** The dev server warns about this, but users may miss it if Wasp is running as a background task. Continue coding freely but inform users of pending migrations before testing/viewing the app and offer to run migrations when the user wants to.

### Deployments

Wasp has one-command deployment to popular hosting services like Railway and Fly.io. Use the `deploying-app` skill to deploy the app to the desired hosting service, if avaiable. Otherwise, defer to the Wasp deployment docs for more details.

## Project Reference

### Structure

```
.
├── .wasp/                    # Wasp output (auto-generated, do not edit)
├── public/                   # Static assets
├── src/                      # Feature code: server `operations.ts` and client `pages.tsx` files
├── main.wasp or main.wasp.ts # Wasp config file: routes, pages, auth, operations, jobs, etc.
├── schema.prisma             # Database schema (Prisma)
```

### Recommended Code Organization

Unless user specifies otherwise, use a vertical, per-feature code organization (not per-type):

```
src/
├── tasks/
│   ├── TasksPage.tsx      # Page component
│   ├── TaskList.tsx       # Component
│   └── operations.ts      # Queries & actions
├── auth/
│   ├── LoginPage.tsx
│   └── google.ts
```

### ShadCN 

ShadCN has already been setup with this project template, so there is no need to install it. All the ShadCN specific components exist in [src/client/components/ui](src/client/components/ui/)

## Adding a new ShadCN component

Wasp doesn't use alias imports for ShadCN components, so install them as follows:

1. Add a new component 

```bash
npx shadcn@latest add button
```

This will generate a button component in `src/client/components/ui/button.tsx`.

2. Adjust the `utils` import in `button.tsx` 

```diff
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

-import { cn } from "src/lib/utils"
+import { cn } from "../../utils"
```

3. Use the component

Import the component like this:
```tsx
import { Button } from './components/ui/button'
```

### Customization

**Do NOT configure Vite, Express, React Query, etc. the usual way.** Wasp has its own mechanisms for customizing these tools. See the **Project Setup & Customization** section in the Wasp docs.

### Advanced Features

Wasp provides **advanced features**:
- custom HTTP API endpoints
- background (cron) jobs
- type-safe links
- websockets
- middleware
- email sending

See the **Advanced Features** section in the Wasp docs for more details.

### Wasp Conventions

#### Imports
**In TypeScript files:**
- ✅ `import type { User } from 'wasp/entities'`
- ✅ `import type { GetTasks } from 'wasp/server/operations'`
- ✅ `import { getTasks, createTask, useQuery } from 'wasp/client/operations'`
- ✅ `import { SubscriptionStatus } from '@prisma/client'` (for Prisma enums)
- ✅ Local code: relative paths `import { X } from './X'`

**In main.wasp:**
- ✅ `fn: import { getTasks } from "@src/tasks/operations"`
- ❌ Never relative paths

**In main.wasp.ts:**
See the **TypeScript Config** section in the Wasp docs for more details.

#### Operations
- ⚠️ Call actions directly using `async/await`. DO NOT use Wasp's `useAction` hook unless optimistic updates are needed.

## Troubleshooting

### Debugging

Always ground your knowledge against the [Wasp documentation](#documentation).

If you don't have full debugging visibility as described in the [Start a Wasp Development Session with Full Debugging Visibility](#start-a-wasp-development-session-with-full-debugging-visibility) section, do the following:
  1. Insist that the user run the `start-dev-server` skill as described in the [Start a Wasp Development Session with Full Debugging Visibility](#start-a-wasp-development-session-with-full-debugging-visibility) section.
  2. If the user refuses, ask them to share the output of the `wasp start` command and the browser console logs.

### Common Mistakes

| Symptom | Fix |
|---------|-----|
| `context.entities.X undefined` | Add entity to `entities: [...]` in main.wasp |
| Schema changes not applying | Run `wasp db migrate-dev --name <descriptive-name>` |
| Can't login after email signup with `Dummy` email provider | Check the server logs for the verification link or set SKIP_EMAIL_VERIFICATION_IN_DEV=true in .env.server |
| Types stale/IDE errors after changes | Restart TS server `Cmd+Shift+P`|
| Wasp not recognizing changes | **WAIT PATIENTLY** as Wasp recompiles the project. Re-run `wasp start` if necessary.|
| Persistent weirdness after waiting patiently and restarting. | Run `wasp clean` && `wasp start` |
