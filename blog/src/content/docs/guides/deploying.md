---
title: Deploying
---

Because this SaaS app is a React/NodeJS/Postgres app built on top of [Wasp](https://wasp-lang.dev), you can deploy it anywhere where static files, NodeJS and Postgres can be hosted and served.

The simplest and quickest option is to take advantage of Wasp's one-command deploy to [Fly.io](https://fly.io).

Or if you prefer to deploy to a different provider, or your frontend and backend separately, you can follow any of the other deployment guides below.

## Prerequisites

Make sure you've got all your API keys and environment variables set up before you deploy. For example, in the [Stripe integration guide](/guides/stripe-integration), you set up your Stripe API keys using test keys and product ids. You'll need to get the production-ready keys and create actual Product IDs. 

## Deploying to Fly.io

[Fly.io](https://fly.io) is a platform for running your apps globally. It's a great choice for deploying your SaaS app because it's free to get started, can host your entire full-stack app in one place, scales well, and has one-command deploy integration with Wasp.

```sh
wasp deploy fly launch <app-name> <region>
```

There are a few prequisites to follow before you can initiate the deploy command. For a detailed guide, check out the [Wasp CLI deployment guide](https://wasp-lang.dev/docs/advanced/deployment/cli).

## Deploying Manually / to Other Providers

If you prefer to deploy manually, your frontend and backend separately, or just prefer using your favorite provider you can follow the [Manual Deployment Guide](https://wasp-lang.dev/docs/advanced/deployment/manually).