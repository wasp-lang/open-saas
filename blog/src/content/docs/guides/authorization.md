---
title: Authorization
banner:
  content: |
    ⚠️ Open SaaS is now running on <a href='https://wasp-lang.dev'>Wasp v0.13</a>! If you're running an older version of Open SaaS, please follow the 
    <a href="https://wasp-lang.dev/docs/migrate-from-0-12-to-0-13">migration instructions here</a> ⚠️ 
---

This guide will help you get started with authorization in your SaaS app. 

Authorization refers to what users can access in your app. This is useful for differentiating between users who have paid for different subscription tiers (e.g. "hobby" vs "pro"), or between users who have admin privileges and those who do not.

Authorization differs from [authentication](/guides/authentication) in that authentication refers to the process of verifying that a user is who they say they are (e.g. logging in with a username and password).

To learn more about the different types of user permissions built into this SaaS template, including Stripe subscription tiers and statuses, check out the [User Permissions Reference](/general/user-permissions).

### Client-side Authorization

All authenticated users have access to the user-facing app, which is the app that sits behind the login. You can easily authorize access to general users from within the `main.wasp` file by adding the `authRequired: true` property to the `page` definition:

```tsx title="main.wasp" {3}
route AccountRoute { path: "/account", to: AccountPage }
page AccountPage {
  authRequired: true,
  component: import Account from "@src/client/app/AccountPage"
}
```

This will automatically redirect users to the login page if they are not logged in.

If you want more fine-grained control over what users can access, there are two Wasp-specific options:
1. When you define the `authRequired: true` property on the `page` definition, Wasp automatically passes the User object to the page component. Here you can check for certain user properties before authorizing access:

```tsx title="ExamplePage.tsx" "{ user }: { user: User }"
import { type User } from "wasp/entities";

export default function Example({ user }: { user: User }) {

  if (user.subscriptionStatus === 'past_due') {
    return (<span>Your subscription is past due. Please update your payment information.</span>)
  }
  if (user.subscriptionStatus === 'canceled') {
    return (<span>Your will susbscription end on 01.01.2024</span>)
  }
  if (user.subscriptionStatus === 'active') {
    return (<span>Thanks so much for your support!</span>)
  }

}
```

2. Or you can take advantage of the `useAuth` hook and check for certain user properties before authorizing access to certain pages or components:

```tsx title="ExamplePage.tsx" {1, 4}
import { useAuth } from "wasp/client/auth";

export default function ExampleHomePage() {
  const { data: user } = useAuth();

  return (
    <h1> Hi {user.email || 'there'} 👋 </h1>
  )
}
```

### Server-side Authorization

You can also authorize access to server-side operations by adding a check to for a logged in user on the `context.user` object which is passed to all operations in Wasp:

```tsx title="src/server/actions.ts" 
export const updateCurrentUser: UpdateCurrentUser<...> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401); // throw an error if user is not logged in
  }

  if (context.user.subscriptionStatus === 'past_due') {
    throw new HttpError(403, 'Your subscription is past due. Please update your payment information.');
  }
  //...
}
```


