# opensaas.sh (demo) app

This is a Wasp app based on Open Saas template with minimal modifications that make it into a demo app that showcases Open Saas's abilities.

It is deployed to https://opensaas.sh and serves both as a landing page for Open Saas and as a demo app.

## UI Components

This template includes [ShadCN UI](https://ui.shadcn.com/) v2 for beautiful, accessible React components. See [SHADCN_SETUP.md](./SHADCN_SETUP.md) for details on how to use ShadCN components in your app.

## Development

### .env files
`.env.client` file is versioned, but `.env.server` file you have to obtain by running `npm run env:pull`, since it has secrets in it.
This will generate `.env.server` based on the `.env.vault`.
We are using https://vault.dotenv.org to power this and have an account/organization up there.
If you modify .env.server and want to persist the changes (for yourself and for the other team members), do `npm run env:push`.

### Running locally
 - Make sure you have the `.env.client` and `.env.server` files with correct dev values in the root of the project.
 - Run the database with `wasp start db` and leave it running.
 - Run `wasp start` and leave it running.
 - [OPTIONAL]: If this is the first time starting the app, or you've just made changes to your entities/prisma schema, also run `wasp db migrate-dev`.

## Deployment

This app is deployed to fly.io, Wasp org, via `wasp deploy fly deploy`.

You can run `npm run deploy` to deploy it via `wasp deploy fly deploy` with required client side env vars correctly set.
