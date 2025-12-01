# Pages (Frontend Components)

## Creating Page Component

1. create `app/src/{feature-name}/{FeatureName}Page.tsx`
2. reference [`../../../app/src/demo-ai-app/DemoAppPage.tsx`](../../../app/src/demo-ai-app/DemoAppPage.tsx) as example

## Implementation Guidelines

**Using Queries:**
- import and use Wasp's `useQuery` hook for reading data
- handle `isLoading` and `error` states
- data automatically refetches after actions

**Using Actions:**
- import action directly from `wasp/client/operations`
- call with `await` (do NOT use `useAction` unless optimistic updates needed)
- wrap in try/catch for error handling

**Using Auth:**
- import and use Wasp's `useAuth` hook for authentication
- or pass Wasp's `AuthUser` object to the page component using props if it is protected by authentication via `authRequired: true` in the wasp config file

**Layout:**
- use Tailwind CSS classes for styling
- prefer the use of ShadCN UI components for styling (some already exist in the template under [`src/client/components/ui`](../../../app/src/client/components/ui/))

## Import Conventions

✅ Correct:
- `import { useQuery } from 'wasp/client/operations'`
- `import { getItems, createItem } from 'wasp/client/operations'`
- `import type { EntityName } from 'wasp/entities'`

❌ Wrong:
- `import { useQuery } from '@wasp/client/operations'`
- `import { getItems } from '@src/feature-name/operations'` (use relative path in TypeScript)
