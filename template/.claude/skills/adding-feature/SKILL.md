---
name: adding-feature
description: plan and scaffold a new feature for the Open SaaS app following Wasp conventions.
---

# adding-feature

## Feature Planning

1. ask the user what feature they want to add
2. gather requirements:
   - does it need authentication?
   - does it need database models (entities)?
   - is it a public or private feature?
   - does it need admin access?
   - what are the main user actions? (create, read, update, delete, etc.)
3. determine feature name in kebab-case (e.g., `todo-list`, `user-notes`)
4. identify which components are needed:
   - database models → see [database.md](./database.md)
   - backend operations (queries/actions) → see [operations.md](./operations.md)
   - frontend pages → see [pages.md](./pages.md)
   - navigation links → see [navigation.md](./navigation.md)

## Implementation Steps

Follow these guides in order:

1. **[Database Setup](./database.md)** - if feature needs entities
2. **[Operations](./operations.md)** - backend queries and actions
3. **[Wasp Configuration](./wasp-config.md)** - register in main.wasp
4. **[Pages](./pages.md)** - frontend components
5. **[Navigation](./navigation.md)** - add to navbar (optional)

## Verification

1. ensure Wasp dev server is running (`wasp start`)
2. if type errors occur, run `cd app && wasp clean && wasp start`
3. test all operations work correctly
4. verify authentication works as expected

## Troubleshooting

see [troubleshooting](./troubleshooting.md)
