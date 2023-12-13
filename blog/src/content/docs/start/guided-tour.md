---
title: Guided Tour
---

Let's get to know our new SaaS app.

First, we'll take a look at the project's file structure, then dive into its main features and how you can get started customizing them.

## Getting acquainted with the codebase

At the root of our project, you will see two folders:
```sh
.
├── app
└── blog
```

`app` contains the Wasp project files, which is your full-stack React + NodeJS + Prisma app along with a Wasp config file, which will be explained in more detail below.

`blog` contains the [Astro Starlight template](https://starlight.astro.build/) for the blog and documentation section. 

Let's check out what's in the `app` folder in more detail:
```sh
.
├── main.wasp              # Wasp Config file. You define your app structure here.
├── src
│   ├── client             # Your client code (React) goes here.
│   ├── server             # Your server code (NodeJS) goes here.
│   ├── shared             # Your shared (runtime independent) code goes here.
│   └── .waspignore
├── .env.server            # Environment variables for your server code.
├── .env.client            # Environment variables for your client code.
└── .wasproot
```

### The Wasp Config file

This template at its core is a Wasp template, where [Wasp](https://wasp-lang.dev) is a full-stack web app framework that let’s you write your app in React, NodeJS, and Prisma and will manage the "boilerplatey" work for you, allowing you to just take care of the fun stuff!

[Wasp's secret sauce](https://wasp-lang.dev/docs) is its use of a config file (`main.wasp`) and compiler which takes your code and outputs the client app, server app and deployment code for you. 

In this template, we've already defined a number of things in the `main.wasp` config file, including:

- Auth
- Routes and Pages
- Prisma Database Models
- Operations (data read and write functions)
- Background Jobs
- Email Sending

By defining these things in the config file, Wasp continuously handles the boilerplate necessary with putting all these features together. You just need to focus on the business logic of your app.

Wasp abstracts away some things that you would normally be used to doing during development, so don't be surprised if you don't see some of the things you're used to seeing.

:::note
It's possible to learn Wasp's feature set simply through using this template, but if you find yourself unsure how to implement a Wasp-specific feature and/or just want to learn more, a great starting point is the intro tutorial in the [Wasp docs](https://wasp-lang.dev/docs/) which takes ~20 minutes.
:::

### Client

The `src/client` folder contains all the code that runs in the browser. It's a standard React app, with a few Wasp-specific things sprinkled in.

```sh
.
└── client
    ├── admin              # Admin dashboard pages and components
    ├── app                # Your user-facing app that sits behind the paywall/login.
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

The `src/server` folder contains all the code that runs on the server. Wasp compiles everything into a NodeJS server for you. 

All you have to do is define your server-side functions in the `main.wasp` file, write the logic in a function within `src/server` and Wasp will generate the boilerplate code for you.

```sh
└── server
    ├── auth               # Some small auth-related functions to customize the auth flow.
    ├── scripts            # Scripts to run via Wasp, e.g. database seeding.
    ├── webhooks           # The webhook handler for Stripe.
    ├── workers            # Functions that run in the background as Wasp Jobs, e.g. daily stats calculation.
    ├── actions.ts         # Your server-side write/mutation functions.
    ├── queries.ts         # Your server-side read functions.
    ├── stripeUtils.ts    
    └── types.ts  
```

## Main Features

### Auth

This template comes with a fully functional auth flow out of the box. It takes advantages of Wasp's built-in [Auth features](https://wasp-lang.dev/docs/auth/overview), which do the dirty work of rolling your own full-stack auth for you!

```js title="main.wasp"
  auth: {
    userEntity: User,
    externalAuthEntity: SocialLogin,
    methods: {
      email: {},
      google: {},
      github: {},
    },
    onAuthFailedRedirectTo: "/",
  },
```

By defining the auth structure in your `main.wasp` file, Wasp generates all the necessary code for you, including:
- Email verified login with reset password
- Social login with Google and/or GitHub
- Custom-generated AuthUI components for login, signup, and reset password
- Auth hooks for fetching user data

<!-- TODO: add pic of AuthUI components -->

We've set the template up with Wasp's simplest auth flow, `usernameAndPassword`, but we suggest you only use it to get your app developlment going and opt for `email`, `google`, `gitHub`, or a combination of them in production.

You'll notice that `google` and `email` methods are also pre-configured. If you'd like to use these configurations in your app, make sure to check out the [Authentication Guide](/guides/authentication) which gives you details on obtaining necessary API keys and integrations.

### Subscription Payments with Stripe

No SaaS is complete without payments, specifically subscription payments. That's why this template comes with a fully functional Stripe integration. 

Let's take a quick look at how payments are handled in this template.

1. a user clicks the `BUY` button and a **Stripe Checkout session** is created on the server
2. the user is redirected to the Stripe Checkout page where they enter their payment info
3. the user is redirected back to the app and the Stripe Checkout session is completed
4. Stripe sends a webhook event to the server with the payment info
5. The app server's **webhook handler** handles the event and updates the user's subscription status

The logic for creating the Stripe Checkout session is defined in the `src/server/actions.ts` file. [Actions](https://wasp-lang.dev/docs/data-model/operations/actions) are your server-side functions that are used to write or update data to the database. Once they're defined in the `main.wasp` file, you can easily call them on the client-side:

a) define the action in the `main.wasp` file
```js title="main.wasp"
action stripePayment {
  fn: import { stripePayment } from "@server/actions.js",
  entities: [User]
}
```

b) implement the action in the `src/server/actions.ts` file
```js title="src/server/actions.ts"
export const stripePayment = async (tier, context) => { 
  //...
 }
 ```

c) call the action on the client-side
```js title="src/client/app/SubscriptionPage.tsx"
import stripePayment from '@wasp/actions/stripePayment';

const handleBuyClick = async (tierId) => {
  const stripeResults = await stripePayment(tierId);
};
```

The webhook handler is defined in the `src/server/webhooks/stripe.ts` file. Unlike Actions and Queries in Wasp which are only to be used internally, we define the webhook handler in the `main.wasp` file as an API endpoint in order to expose it externally to Stripe

```js title="main.wasp"
api stripeWebhook {
  fn: import { stripeWebhook } from "@server/webhooks/stripe.js",
  httpRoute: (POST, "/stripe-webhook")
  entities: [User],
}
```

Within the webhook handler, we look for specific events that Stripe sends us to let us know which payment was completed and for which user. Then we update the user's subscription status in the database.

To learn more about configuring the app to handle your products and payments, check out the [Stripe Integration guide](/guides/stripe-integration).

### Analytics and Admin Dashboard

Keeping an eye on your metrics is crucial for any SaaS. That's why we've built an administrator's dashboard where you can view your app's stats, user data, and Stripe revenue all in one place.

<!-- TODO: add pic of admin dash -->

To do that, we've leveraged Wasp's [Jobs feature](https://wasp-lang.dev/docs/advanced/jobs) to run a cron job that calculates your daily stats. The app stats, such as page views and sources, can be pulled from either Plausible or Google Analytics. All you have to do is create an project with the analytics provider of your choice and import the repsective pre-built helper functions!

```js title="main.wasp"
job dailyStatsJob {
  executor: PgBoss,
  perform: {
    fn: import { calculateDailyStats } from "@server/workers/calculateDailyStats.js"
  },
  schedule: {
    cron: "0 * * * *" // runs every hour
  },
  entities: [User, DailyStats, Logs, PageViewSource]
}
```

For more info on integrating Plausible or Google Analytics, check out the [Analytics guide](/guides/analytics).

