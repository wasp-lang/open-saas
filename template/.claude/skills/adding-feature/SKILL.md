---
name: adding-feature
description: plan and scaffold a new feature for the Open SaaS app following Wasp conventions.
---

# adding-feature

## Planning Requirement

**IMPORTANT:** Before implementing any feature, use the EnterPlanMode tool to:
1. Explore existing code patterns in the codebase
2. Design the implementation approach
3. Write a plan file for user approval and/or add tasks to the todo list with TodoWrite tool.

Only proceed with implementation after the user approves the plan.

## Feature Planning

### Requirements Gathering

When gathering requirements (either before or during plan mode), ask about:
1. ask the user what feature they want to add
2. gather requirements:
   - **Access:** public, authenticated, or admin-only?
   - **Subscription tier:** available to all users or gated by plan (hobby/pro)?
   - **Usage limits:** should it consume credits or have rate limits?
   - **Data model:** what entities are needed? relate to User?
   - **Operations:** what can users do? (CRUD, custom actions)
   - **Admin visibility:** should admins see this data in the dashboard?
   - **Background work:** needs scheduled jobs or async processing?
   - **External APIs:** any third-party integrations?
3. determine feature name in kebab-case (e.g., `todo-list`, `user-notes`)

## Implementation Steps

Follow these guide:

1. **[Database Setup](./database.md)** - if feature needs entities
2. **[Operations](./operations.md)** - backend queries and actions
3. **[Wasp Configuration](./wasp-config.md)** - register in wasp config file
4. **[Pages](./pages.md)** - frontend components
5. **[Background Jobs](./background-jobs.md)** - scheduled or async background jobs

## Verification

1. ensure Wasp dev server is running (`wasp start`)
2. if type errors occur, restart the Wasp dev server
3. test all operations work correctly
4. verify authentication works as expected

## Troubleshooting

see [troubleshooting](./troubleshooting.md)

## Documentation

Fetch guide URLs directly:
- https://wasp.sh/llms.txt

If you need more specific info, use mcp__wasp-docs__find_docs to search.
