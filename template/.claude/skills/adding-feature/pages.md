# Pages (Frontend Components)

## Setup

1. create `app/src/{feature-name}/{FeatureName}Page.tsx`
2. reference [`../../../app/src/demo-ai-app/DemoAppPage.tsx`](../../../app/src/demo-ai-app/DemoAppPage.tsx) as example

## Guidelines

- **Queries:** use `useQuery` hook, handle `isLoading`/`error` states
- **Actions:** call directly with `await` (no `useAction` unless optimistic updates needed)
- **Auth:** use `useAuth` hook, or receive `AuthUser` via props on protected pages
- **Styling:** use Tailwind + ShadCN components from [`src/client/components/ui`](../../../app/src/client/components/ui/)

Import conventions are in project CLAUDE.md.
