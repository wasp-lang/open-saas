# <YOUR_APP_NAME>

Built with [Wasp](https://wasp.sh), based on the [Open Saas](https://opensaas.sh) template.

## Development

### Running locally

Make sure you have the `.env.client` and `.env.server` files with correct dev values in the root of the project.

Run migrations, then start the app:

```sh
wasp db migrate-dev
wasp start
```

Wasp starts the development database automatically.

Run migrations again after changing your Prisma schema.

Stop the app before running migrations, `wasp db seed`, `wasp db studio`, or `wasp db reset`.
