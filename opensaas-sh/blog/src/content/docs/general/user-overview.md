---
title: User Overview
description: "Reference for the User entity in Open SaaS: its Prisma schema fields, subscription plans and statuses synced from your payment processor, and admin roles."
banner:
  content: |
    Have an Open SaaS app in production? <a href="https://e44cy1h4s0q.typeform.com/to/EPJCwsMi">We'll send you some swag! 👕</a>
---

This reference will help you understand how the User entity works in this template.
This includes the user roles, subscription plans and statuses, and how to authorize access to certain pages and components.

## User Entity

The `User` entity within your app is defined in the `schema.prisma` file:

```prisma title="schema.prisma" ins="User: {}"
model User {
  id                        String          @id @default(uuid())
  createdAt                 DateTime        @default(now())

  email                     String?         @unique
  username                  String?         @unique
  isAdmin                   Boolean         @default(false)

  paymentProcessorUserId    String?         @unique
  subscriptionStatus        String?         // 'active', 'trialing', 'past_due', 'paused', 'canceled'.
  subscriptionPlan          String?         // 'hobby', 'pro'.
  currentPeriodEnd          DateTime?
  cancelAtPeriodEnd         Boolean         @default(false)
  datePaid                  DateTime?
  credits                   Int             @default(3)

  gptResponses              GptResponse[]
  contactFormMessages       ContactFormMessage[]
  tasks                     Task[]
  files                     File[]
}
```

We store all user relevant information on the `User` entity, including identification, subscription, and payment processor information. Meanwhile, Wasp abstracts away all the Auth related entities dealing with `passwords`, `sessions`, and `socialLogins`, so you don't have to worry about these at all in your Prisma schema (if you want to learn more about this process, check out the [Wasp Auth Docs](https://wasp.sh/docs/auth/overview)).

### Payment Processors and Subscriptions

We use payment processor to handle all of our subscription payments. The `User` entity has a number of fields that are related to payment processors and their ability to access features behind the paywall:

```prisma title="schema.prisma" {3-9}
model User {
  // ...
  paymentProcessorUserId    String?         @unique
  subscriptionStatus        String?         // 'active', 'trialing', 'past_due', 'paused', 'canceled'.
  subscriptionPlan          String?         // 'hobby', 'pro'.
  currentPeriodEnd          DateTime?
  cancelAtPeriodEnd         Boolean         @default(false)
  datePaid                  DateTime?
  credits                   Int             @default(3)
  // ...
}
```

- `paymentProcessorUserId`: The payment processor's customer ID. This is created on checkout and used to identify the customer.
- `subscriptionStatus`: The subscription status of a user. This is set by the payment processor and is used to determine whether the user has access to the app or not. By default, we have five statuses: `active`, `trialing`, `past_due`, `paused`, and `canceled`.
- `currentPeriodEnd`: When the current billing period ends. The subscription renews on this date, or ends on it if `cancelAtPeriodEnd` is set.
- `cancelAtPeriodEnd`: Whether the user has canceled their subscription. They keep access until `currentPeriodEnd`.
- `subscriptionPlan`: The subscription plan a user is on. This is set by the app and is used to determine what features the user has access to. By default, we have three payment plans: `hobby` and `pro` subscription plans, as well as a `credits10` one-time purchase plan.
- `credits` (optional): By default, a user is given 3 credits to trial your product before they have to pay. You can create a one-time purchase product in Stripe to allow users to purchase more credits if they run out, e.g. the `credits10` plan in the template.

#### Subscription Statuses

The payment processor owns the subscription, and the `User` fields hold a copy of it. Webhook events can arrive late, twice or out of order, so we don't build that copy from their payloads. Every event that can change a subscription calls `syncUserSubscription` in `src/payment/subscription.ts`, which fetches the subscription again and overwrites the copy. The same happens when the user returns from checkout. The approach comes from [Theo's Stripe recommendations](https://github.com/t3dotgg/stripe-recommendations).

The template handles five statuses:

- `active`: the user has paid and has access. If `cancelAtPeriodEnd` is set, they have canceled and keep access until `currentPeriodEnd`.
- `trialing`: the user is in a free trial and has access. The template doesn't set up trials. The status only covers trials you configure in your payment processor.
- `past_due`: the renewal payment was declined, e.g. the credit card expired. The user has no access.
- `paused`: billing is paused. The user has no access.
- `canceled`: the subscription has ended. The user has no access.

`subscriptionStatus` is empty for users who never had a subscription.

`hasActiveSubscription` in `src/payment/plans.ts` decides which statuses give access. To keep access while a payment is past due, add `past_due` there.

You can also react to a status change. For example, you can send the user an email to update their payment information:
  ```ts title="src/payment/subscription.ts"
  import { emailSender } from "wasp/server/email";
  //...

  const hasPaymentJustFailed =
    user.subscriptionStatus === SubscriptionStatus.PastDue &&
    userBeforeSync.subscriptionStatus !== SubscriptionStatus.PastDue;
  if (hasPaymentJustFailed && user.email) {
    await emailSender.send({
      to: user.email,
      subject: 'Your Payment is Past Due',
      text: 'Please update your payment information to continue using our service.',
      html: '...',
    });
  }
  ```

See the client-side [authorization section](/guides/authorization/) below for more info on how to handle these statuses within your app.

#### Subscription Plans

The `subscriptionPlan` field is used to determine what features the user has access to. 

By default, we have three plans: `hobby` and `pro` subscription plans, as well as a `credits10` one-time purchase plan. 

You can add more plans by adding more prodcuts to your payment processor and updating environment variables in your `.env.server` file as well as the relevant code in your app.

See the [Payment Integrations Guide](/guides/payment-integrations/) of a specific payment processor for more info on how to do this.

### User Roles

At the moment, we have two user roles: `admin` and `user`. This is defined within the `isAdmin` field in the `User` entity:

```prisma title="schema.prisma" {5}
model User {
  // ...
  email                     String?         @unique
  username                  String?         @unique
  isAdmin                   Boolean         @default(false)
  //...
}
```

As an `admin`, a user has access to the Admin dashboard, along with the user table where they can view and search for users, and edit and update information manually if necessary.

:::tip[Admin Privileges]
If you'd like to give yourself and/or certain users admin privileges, follow the instructions in the [Admin Dashboard](/general/admin-dashboard/#permissions) section.
:::

As a `user`, a user has access to the user-facing app that sits behind the login, but not the Admin dashboard. You can further restrict access to certain features within the app by following the [authorization guide](/guides/authorization/).
