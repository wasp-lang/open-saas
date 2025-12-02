# Operations (Backend Logic)

## Setup

1. create `app/src/{feature-name}/operations.ts`
2. reference [`../../../app/src/demo-ai-app/operations.ts`](../../../app/src/demo-ai-app/operations.ts) as example

## Guidelines

- **Queries:** for reading data
- **Actions:** for create/update/delete
- check `if (!context.user)` for authenticated operations
- verify ownership before modifying resources
- access database via `context.entities.EntityName`
- use `HttpError` from `wasp/server` for errors

Import conventions are in project CLAUDE.md.
