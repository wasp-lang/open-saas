---
name: starting-wasp
description: start the Wasp development server correctly with all required services.
---

# starting-wasp

## Starting the Development Server

1. check if the user has Wasp installed by running `wasp version`.
2. if Wasp is not installed, instruct them to install it with: `curl -sSL https://get.wasp.sh/installer.sh | sh`
3. check if PostgreSQL is needed by reading [`./app/schema.prisma`](../../../app/schema.prisma) to see if the database provider is `postgresql`.
4. if PostgreSQL is required:
   - ask if they have PostgreSQL running locally or want to use Wasp's managed database.
   - if they want Wasp's managed database, run `wasp start db` in the `template/app` directory first (in the background or instruct to run in separate terminal).
   - if they have their own database running, inform them that they need to set the correct `DATABASE_URL` in [`./app/.env.server`](../../../app/.env.server).
5. run `wasp start` in the `template/app` directory in a separate terminal to start the development server.

## Viewing Server Logs

1. the Wasp dev server shows combined client and server logs.
2. server logs will show database queries, API calls, and errors.
3. client logs will show React component renders and frontend errors.

## Troubleshooting

see [troubleshooting](../troubleshooting.md)
