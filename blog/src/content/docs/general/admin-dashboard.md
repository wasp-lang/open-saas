---
title: Admin Dashboard
banner:
  content: |
    ⚠️ Open SaaS is now running on <a href='https://wasp-lang.dev'>Wasp v0.13</a>! If you're running an older version of Open SaaS, please follow the 
    <a href="https://wasp-lang.dev/docs/migrate-from-0-12-to-0-13">migration instructions here</a> ⚠️ 
---
This is a reference on how the Admin dashboard is set up and works.

## Permissions

The Admin dashboard is only accessible to users with the `isAdmin` field set to true.

```tsx title="main.wasp" {5}
entity User {=psl
  id                        Int             @id @default(autoincrement())
  email                     String?         @unique
  username                  String?
  isAdmin                   Boolean         @default(false)
  //...
```

To give yourself administrator priveledges, make sure you add your email adderesses to the `ADMIN_EMAILS` environment variable in `.env.server` file before registering/logging in with that email address.

```sh title=".env.server"
ADMIN_EMAILS=me@example.com
```

if you want to give administrator priveledges to other users, you can do so by adding them to `ADMIN_EMAILS` as a comma-separated list.

```sh title=".env.server"
ADMIN_EMAILS=me@example.com,you@example.com,them@example.com
```

:::tip[Star our Repo on GitHub! 🌟]
We've packed in a ton of features and love into this SaaS starter.

If you're finding this template and its guides useful, consider giving us [a star on GitHub](https://github.com/wasp-lang/wasp)
:::

## Admin Dashboard Pages

### Dashboard
The Admin dashboard is a single place for you to view your most important metrics and perform some admin tasks. At the moment, it pulls data from:

<!-- TODO: add photo -->

- [Stripe](/guides/stripe-integration):
  - total revenue
  - revenue for each day of the past week
- [Google or Plausible](/guides/analytics): 
  - total number of page views (non-unique)
  - percentage change in page views from the previous day
  - top sources/referrers with unique visitor count (i.e. how many people came from that source to your app)
- Database:
  - total number of registered users
  - daily change in number of registered users 
  - total number of paying users
  - daily change in number of paying users

For a guide on how to integrate these services, check out the [Stripe](/guides/stripe-integration) and [Analytics guide](/guides/analytics) of the docs.

:::tip[Help us improve]
We're always looking to improve the Admin dashboard. If you feel something is missing or could be improved, consider [opening an issue](https://github.com/wasp-lang/open-saas/issues) or [submitting a pull request](https://github.com/wasp-lang/open-saas/pulls)
:::

### Users
The Users page is where you can view all your users and their most important details. You can also search and filter users by:
- email address
- subscription/payment status

