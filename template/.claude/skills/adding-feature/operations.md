# Operations (Backend Logic)

## Setup

1. create `app/src/{feature-name}/operations.ts`

## Guidelines

- **Queries:** for reading data
- **Actions:** for create/update/delete
- check `if (!context.user)` for authenticated operations
- check user subscription status before granting access to premium features
- verify ownership before modifying resources
- access database via `context.entities.EntityName`
- use `HttpError` from `wasp/server` for errors

Import conventions are in project CLAUDE.md.
