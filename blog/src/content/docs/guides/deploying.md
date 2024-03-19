---
title: Deploying
banner:
  content: |
    ⚠️ Open SaaS is now running on <a href='https://wasp-lang.dev'>Wasp v0.13</a>! If you're running an older version of Open SaaS, please follow the 
    <a href="https://wasp-lang.dev/docs/migrate-from-0-12-to-0-13">migration instructions here</a> ⚠️ 
---

Because this SaaS app is a React/NodeJS/Postgres app built on top of [Wasp](https://wasp-lang.dev), you can deploy it anywhere where static files, NodeJS and Postgres can be hosted and served.

The simplest and quickest option is to take advantage of Wasp's one-command deploy to [Fly.io](https://fly.io).

Or if you prefer to deploy to a different provider, or your frontend and backend separately, you can follow any of the other deployment guides below.

If you're looking to deploy your Blog, you can follow the [Deploying your Blog](#deploying-your-blog) section at the end of this guide.

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

## Deploying your Blog

Deploying your Astro Starlight blog is a bit different than deploying your SaaS app. As an example, we will show you how to deploy your blog for free to Netlify. You will need a Netlify account and [Netlify CLI](https://docs.netlify.com/cli/get-started/) installed to follow these instructions.

Make sure you are logged in with Netlify CLI. 
- You can check if you are logged in with `netlify status`, 
- you can log in with `netlify login`.

Position yourself in the `blog` directory and run the following command:

```sh
npm run build
```

This will build your blog into the `blog/dist` directory. Now you can deploy your blog to Netlify with the following command:

```sh
netlify deploy 
``` 

Select the `dist` directory as the deploy path.

Finally, if the deployment looks good, you can deploy your blog to production with the following command: 
  
```sh
netlify deploy --prod
```