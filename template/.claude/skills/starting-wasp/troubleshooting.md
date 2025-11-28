# Troubleshooting Starting Wasp

## Using Wasp's Managed Database

The command `wasp start db` will start a default PostgreSQL dev database for you.

Your Wasp app will automatically connect to it, just keep `wasp start db` running in the background. Also, make sure that:

- You have Docker installed and it's available in your PATH or Docker Desktop is running.
- The port `5432` isn't taken.

## Using an Existing Database

- if the user has their own database running, inform them that they need to set the correct `DATABASE_URL` in [`./app/.env.server`](../../../app/.env.server).
- if they do not have a `.env.server` file, inform them that they can create it by copying the contents of [`./app/.env.server.example`](../../../app/.env.server.example).

## Starting with a Clean State

1. if the user is experiencing issues, suggest running `wasp clean` first to clear generated code and caches.
2. then follow the normal starting procedure above.