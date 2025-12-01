---
name: adding-feature
description: plan and scaffold a new feature for the Open SaaS app following Wasp conventions.
---

# adding-feature

## Feature Planning

1. ask the user what feature they want to add
2. gather requirements:
   - does it need authentication?
   - what kind of database models (entities) may be needed?
   - what are the main user actions? (create, read, update, delete, etc.)
   - what dependencies may be needed?
   - what integrations may be needed?
   - what types of UI components may be needed?
   - might this feature make use of wasp's jobs feature?
   - etc.
3. determine feature name in kebab-case (e.g., `todo-list`, `user-notes`)

## Implementation Steps

Follow these guide:

1. **[Database Setup](./database.md)** - if feature needs entities
2. **[Operations](./operations.md)** - backend queries and actions
3. **[Wasp Configuration](./wasp-config.md)** - register in wasp config file
4. **[Pages](./pages.md)** - frontend components

## Verification

1. ensure Wasp dev server is running (`wasp start`)
2. if type errors occur, restart the Wasp dev server
3. test all operations work correctly
4. verify authentication works as expected

## Troubleshooting

see [troubleshooting](./troubleshooting.md)
