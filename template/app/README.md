# <YOUR_APP_NAME>

Built with [Wasp](https://wasp.sh), based on the [Open Saas](https://opensaas.sh) template.

## Development

### Running locally

- Make sure you have the `.env.client` and `.env.server` files with correct dev values in the root of the project.
- Make sure Docker is running.
- Run `wasp db migrate-dev` on first setup and after changing your Prisma schema.
- Run `wasp start`.

Without `DATABASE_URL`, Wasp starts the PostgreSQL development database if needed. Each command stops the database it started when it exits. Your data persists.

Stop the app before running migrations, `wasp db seed`, `wasp db studio`, or `wasp db reset`.
