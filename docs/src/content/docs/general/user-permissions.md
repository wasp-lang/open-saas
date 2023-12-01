---
title: User Permissions
---

This reference will help you understand how the user permissions work in this template.
This includes the user roles, subscription tiers and statuses, and how to authorize access to certain pages and components.

## User Entity

The `User` entity within your app is defined in the `main.wasp` file:

```tsx title="main.wasp" ins="User: {}"
entity User {=psl
  id                        Int             @id @default(autoincrement())
  email                     String?         @unique
  password                  String?
  createdAt                 DateTime        @default(now())
  lastActiveTimestamp       DateTime        @default(now())
  isAdmin                   Boolean         @default(false)
  isEmailVerified           Boolean         @default(false)
  emailVerificationSentAt   DateTime?
  passwordResetSentAt       DateTime?
  stripeId                  String? 
  checkoutSessionId         String?
  hasPaid                   Boolean         @default(false)
  subscriptionTier          String?
  subscriptionStatus        String?
  sendEmail                 Boolean         @default(false)
  datePaid                  DateTime?
  credits                   Int             @default(3)
  relatedObject             RelatedObject[]
  externalAuthAssociations  SocialLogin[]
  contactFormMessages       ContactFormMessage[]      
psl=}
```

We store all pertinent information to the user, including Auth, Subscription, and Stripe information.

## Stripe and Subscriptions

We use Stripe to handle all of our subscription payments. The `User` entity has a number of fields that are related to Stripe and their ability to access features behind the paywall:

```tsx title="main.wasp" {4-10}
entity User {=psl
  id                        Int             @id @default(autoincrement())
  //...
  stripeId                  String? 
  checkoutSessionId         String?
  hasPaid                   Boolean         @default(false)
  subscriptionTier          String?
  subscriptionStatus        String?
  datePaid                  DateTime?
  credits                   Int             @default(3)
  //...
psl=}
```

- `stripeId`: The Stripe customer ID. This is created by Stripe on checkout and used to identify the customer.
- `checkoutSessionId`: The Stripe checkout session ID. This is created by Stripe on checkout and used to identify the checkout session.
- `hasPaid`: A boolean that indicates whether the user has paid for a subscription or not.
- `subscriptionTier`: The subscription tier the user is on. This is set by the app and is used to determine what features the user has access to. By default, we have two tiers: `hobby-tier` and `pro-tier`.
- `subscriptionStatus`: The subscription status of the user. This is set by Stripe and is used to determine whether the user has access to the app or not. By default, we have four statuses: `active`, `past_due`, `canceled`, and `deleted`.
- `credits` (optional): You can allow a user to trial your product with a limited number of credits before they have to pay.

### Subscription Statuses

In general, we determine if a user has paid for an initial subscription by checking if the `hasPaid` field is true. If it is, we know that the user has paid for a subscription and we can grant them access to the app.

The `subscriptionStatus` field is set by Stripe within your webhook handler and is used to signify more detailed information on the user's current status. By default, the template handles four statuses: `active`, `past_due`, `canceled`, and `deleted`.

- When `active` the user has paid for a subscription and has full access to the app. 

- When `canceled`, the user has canceled their subscription and has access to the app until the end of their billing period. 

- When `deleted`, the user has reached the end of their subscription period after canceling and no longer has access to the app.

- When `past_due`, the user's automatic subscription renewal payment was declined (e.g. their credit card expired). You can choose how to handle this status within your app. For example, you can send the user an email to update their payment information:
```tsx title="src/server/webhooks/stripe.ts" 
import { emailSender } from '@wasp/email/index.js';
//...

if (subscription.status === 'past_due') {
  const updatedCustomer = await context.entities.User.update({
    where: {
      id: customer.id,
    },
    data: {
      subscriptionStatus: 'past_due',
    },
  });

  if (updatedCustomer.email) {
    await emailSender.send({
      to: updatedCustomer.email,
      subject: 'Your Payment is Past Due',
      text: 'Please update your payment information to continue using our service.',
      html: '...',
    });
  }
}
```

See the client-side [authorization section](/guides/authorization) below for more info on how to handle these statuses within your app.

### Subscription Tiers

The `subscriptionTier` field is used to determine what features the user has access to. 

By default, we have two tiers: `hobby-tier` and `pro-tier`. 

You can add more tiers by adding more products and price IDs to your Stripe product  and updating environment variables in your `.env.server` file as well as the relevant code in your app.

See the [Stripe Integration Guide](/guides/stripe-integration) for more info on how to do this.

## User Roles

At the moment, we have two user roles: `admin` and `user`. This is defined within the `isAdmin` field in the `User` entity:

```tsx title="main.wasp" {7}
entity User {=psl
  id                        Int             @id @default(autoincrement())
  email                     String?         @unique
  password                  String?
  createdAt                 DateTime        @default(now())
  lastActiveTimestamp       DateTime        @default(now())
  isAdmin                   Boolean         @default(false)
//...
psl=}
```
<!--  TODO: add screenshot of user table -->

As an Admin, a user has access to the Admin dashboard, along with the user table where they can view and search for users, and edit and update information manually if necessary.

As a general User, a user has access to the user-facing app that sits behind the login, but not the Admin dashboard. You can further restrict access to certain features within the app by following the [authorization guide](/guides/authorization).
