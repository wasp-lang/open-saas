---
name: migrating-db
description: migrate the database after making changes to `schema.prisma`.
---

# migrating-db

## Migrating the Database

1. read the status of [`./app/migrations`](../../../app/migrations) directory
2. read [`./app/schema.prisma`](../../../app/schema.prisma) and compare to the current database schema.
3. if there are no pending migrations, exit.
4. choose a migration name that describes what changed.
5. run `npx prisma migrate dev --name <migration-name>` to create a new migration.

## Viewing the Database GUI

1. ask the user if they want to view the database GUI.
2. if they do, run `wasp db studio` in a separate terminal.
3. open [http://localhost:5555](http://localhost:5555) in the browser.

## Troubleshooting

see [troubleshooting](../troubleshooting.md)

## Documentation

Fetch guide URLs directly:
- https://wasp.sh/llms.txt

If you need more specific info, use mcp__wasp-docs__find_docs to search.