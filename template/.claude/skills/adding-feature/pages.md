# Pages (Frontend Components)

## Creating Page Component

1. create `app/src/{feature-name}/{FeatureName}Page.tsx`
2. reference [`../../../app/src/demo-ai-app/DemoAppPage.tsx`](../../../app/src/demo-ai-app/DemoAppPage.tsx) as example

## Implementation Guidelines

**Using Queries:**
- import and use `useQuery` hook for reading data
- handle `isLoading` and `error` states
- data automatically refetches after actions

**Using Actions:**
- import action directly from `wasp/client/operations`
- call with `await` (do NOT use `useAction` unless optimistic updates needed)
- wrap in try/catch for error handling

**Layout:**
- follow existing page structure from demo-ai-app
- use Tailwind CSS classes for styling
- include proper dark mode support (`dark:` classes)

## Import Conventions

✅ Correct:
- `import { useQuery } from 'wasp/client/operations'`
- `import { getItems, createItem } from 'wasp/client/operations'`
- `import type { EntityName } from 'wasp/entities'`

❌ Wrong:
- `import { useQuery } from '@wasp/client/operations'`
- `import { getItems } from '@src/feature-name/operations'` (use relative path in TypeScript)
