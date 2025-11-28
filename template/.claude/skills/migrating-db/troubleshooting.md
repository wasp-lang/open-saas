# Troubleshooting Database Migrations

## Connecting to a Database

If you are using PostgreSQL, Wasp supports two ways of connecting to a database:

1. Using the Dev Database provided by Wasp with `wasp start db`.
2. Using an existing database by specifying a database URL in `.env.server`

## Using the Dev Database provided by Wasp with `wasp start db`

The command `wasp start db` will start a default PostgreSQL dev database for you.

Your Wasp app will automatically connect to it, just keep `wasp start db` running in the background. Also, make sure that:

- You have Docker installed and it's available in your PATH or Docker Desktop is running.
- The port `5432` isn't taken.
