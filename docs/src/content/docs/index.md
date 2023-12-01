---
title: Introduction
---

## Welcome to your new SaaS App!

<!-- {/* TODO: add a screenshot of the app */} -->

You've decided to build a SaaS app with this template. Great choice! 🎉

This template is:

1. fully open-source
2. completely free to use and distribute
3. comes with a ton of features out of the box!

Try it out here: [OpenSaaS.sh](https://opensaas.sh)  
Check out the Code: [Open SaaS GitHub Repo](https://github.com/wasp-lang/open-saas)

## What's inside?

The template itself is built on top of some very powerful tools and frameworks, including:

- 🐝 [Wasp](https://wasp-lang.dev) - a full-stack React, NodeJS, Prisma framework with superpowers
- 🚀 [Astro](https://starlight.astro.build/) - Astro's lightweight "Starlight" template for documentation and blog
- 💸 [Stripe](https://stripe.com) - for products and payments
- 📈 [Plausible](https://plausible.io) or [Google](https://analytics.google.com/) Analytics
- 🤖 [OpenAI](https://openai.com) - OpenAI API integrated into the app
- 📧 [SendGrid](https://sendgrid.com), [MailGun](https://mailgun.com), or SMTP - for email sending
- 💅 [TailwindCSS](https://tailwindcss.com) - for styling
- 🧑‍💼 [TailAdmin](https://tailadmin.com/) - admin dashboard & components for TailwindCSS

Because we're using Wasp as the full-stack framework, we can leverage a lot of its features to build our SaaS in record time, including:

- 🔐 [Full-stack Authentication](https://wasp-lang.dev/docs/auth/overview) - Email verified + social Auth in a few lines of code.
- ⛑ [End-to-end Type Safety](https://wasp-lang.dev/docs/data-model/operations/overview) - Type your backend functions and get inferred types on the front-end automatically, without the need to install or configure any third-party libraries. Oh, and type-safe Links, too!
- 🤖 [Jobs](https://wasp-lang.dev/docs/language/features#jobs) - Run cron jobs in the background or set up queues simply by defining a function in the config file.
- 🚀 [One-command Deploy](https://wasp-lang.dev/docs/advanced/deployment/overview) - Easily deploy via the CLI to [Fly.io](https://fly.io), or to other provides like [Railway](https://railway.app) and [Netlify](https://netlify.com).

You also get access to Wasp's diverse, helpful community if you get stuck or need help.
- 🤝 [Wasp Discord](https://discord.gg/aCamt5wCpS)

:::tip["Work In Progress"]
We've tried to get as many of the core features of a SaaS app into this template as possible, but there still might be some missing features or functionality.

We could always use some help tying up loose ends, so consider [contributing](https://github.com/wasp-lang/open-saas/blob/main/CONTRIBUTING.md)!
:::

## Getting acquainted with the codebase

At the root of our project, you will see the following folders and files:

```sh
.
├── .gitignore
├── main.wasp              # Wasp Config file. You define your app structure here.
├── src
│   ├── client             # Your client code (JS/CSS/HTML) goes here.
│   ├── server             # Your server code (Node JS) goes here.
│   ├── shared             # Your shared (runtime independent) code goes here.
│   └── .waspignore
├── docs                   # Astro Starlight template for your documentation and blog.
├── .env.server            # Environment variables for your server code.
├── .env.client            # Environment variables for your client code.
└── .wasproot
```

### Wasp Config file

The `main.wasp` file is where you define your app structure.

In this template, we've already defined a number of things for you, including:

- Auth
- Routes and Pages
- Prisma Database Models
- Operations (data read and write functions)
- Background Jobs
- Email Sending

By defining these things in the config file, Wasp continuously handles the boilerplate necessary with putting all these features together. You just need to focus on the business logic of your app!

Wasp abstracts away some things that you would normally be used to doing during development. For exmaple, you may notice there's no `package.json` file at the root of the project.

That's why we highly suggest you get acquainted with Wasp. A great starting point is the intro tutorial in the [Wasp docs](https://wasp-lang.dev/docs/) which takes ~20 minutes.

### Client

The `src/client` folder contains all the code that runs in the browser. It's a standard React app, with a few Wasp-specific things sprinkled in.

```sh
.

└── client
    ├── admin              # Admin dashboard pages and components
    ├── app                # Your user-facing app that sits behind the login.
    ├── auth               # All auth-related pages and components.
    ├── components         # Your shared React components.
    ├── hooks              # Your shared React hooks.
    ├── landing-page       # Landing page related code
    ├── public             # Assets that are publicly accessible, e.g. www.yourdomain.com/banner.png
    ├── static             # Assets that you need access to in your code, e.g. import logo from 'static/logo.png'
    ├── App.tsx            # Main app component to wrap all child components. Useful for global state, navbars, etc.
    └── Main.css

```

### Server

The `src/server` folder contains all the code that runs on the server. Wasp compiles everything into a NodeJS server for you. All you have to do is define your server-side functions in the `main.wasp` file, write the logic in a function within `src/server` and Wasp will generate the boilerplate code for you.

```sh
└── server
    ├── auth               # Some small auth-related functions to customize the auth flow.
    ├── scripts            # Scripts to run via Wasp, e.g. database seeding.
    ├── webhooks           # The webhook handler for Stripe.
    ├── workers            # Functions that run in the background as Wasp Jobs, e.g. daily stats calculation.
    ├── actions.ts         # Your server-side write/mutation functions.
    ├── queries.ts         # Your server-side read functions.
    ├── stripeUtils.ts
    ├── static             # Assets that you need access to in your code, e.g. import logo from 'static/logo.png'
    ├── types.ts           # Main app component to wrap all child components. Useful for global state, navbars, etc.
    └── Main.css
```
