# Operations (Backend Logic)

## Creating operations.ts

1. create directory: `mkdir -p app/src/{feature-name}/`
2. create `app/src/{feature-name}/operations.ts`
3. reference [`../../../app/src/demo-ai-app/operations.ts`](../../../app/src/demo-ai-app/operations.ts) as example

## Implementation Guidelines

**Queries (reading data):**
- use for fetching data
- return data from database via `context.entities.EntityName`
- always check `if (!context.user)` for authenticated operations

**Actions (writing data):**
- use for create, update, delete operations
- always verify ownership before modifying resources
- validate input data before processing

**Error Handling:**
- use `HttpError` from `wasp/server`

**Database Access:**
- access via `context.entities.EntityName`
- use Prisma methods on these entities

## Import Conventions

✅ Correct:
- `import { HttpError } from 'wasp/server'`
- `import type { GetItems } from 'wasp/server/operations'`
- `import type { EntityName } from 'wasp/entities'`

❌ Wrong:
- `import { HttpError } from '@wasp/server'`
