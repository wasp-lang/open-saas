---
title: Stripe Integration
banner:
  content: |
    Open SaaS is now running on <a href='https://wasp-lang.dev'>Wasp v0.14</a>! <br/>🐝🚀<br/>If you're running an older version, please follow the <a href="https://wasp-lang.dev/docs/migrate-from-0-13-to-0-14">migration instructions.</a>
---

This guide will show you how to set up your Stripe account for testing and local development. 

Once you deploy your app, you can follow the same steps, just make sure you're using your live Stripe API keys and product IDs and you are no longer in test mode within the Stripe Dashboard.

To get started, you'll need to create a Stripe account. You can do that [here](https://dashboard.stripe.com/register).

:::tip[Star our Repo on GitHub! 🌟]
We've packed in a ton of features and love into this SaaS starter, and offer it all to you for free!

If you're finding this template and its guides useful, consider giving us [a star on GitHub](https://github.com/wasp-lang/wasp)
:::

## Get your test Stripe API Keys

Once you've created your account, you'll need to get your test API keys. You can do that by navigating to [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys) or by going to the [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard) and clicking on the `Developers`.

![test api keys](/stripe/api-keys.png)

- Click on the `Reveal test key token` button and copy the `Secret key`.
- Paste it in your `.env.server` file under `STRIPE_KEY=`

## Create Test Products

To create a test product, go to the test products url [https://dashboard.stripe.com/test/products](https://dashboard.stripe.com/test/products), or after navigating to your dashboard, click the `test mode` toggle.

![test product](/stripe/test-product.png)

- Click on the `Add a product` button and fill in the relevant information for your product. 
- Make sure you select `Software as a service (SaaS)` as the product type.
- For Subscription products, make sure you select `Recurring` as the billing type.
- For One-time payment products, make sure you select `One-time` as the billing type.
- If you want to add different price tiers for the same product, click the `Add another price` button at the buttom. 

![price ids](/stripe/price-ids.png)

- After you save the product, you'll be directed to the product page. 
- Copy the price IDs and paste them in the `.env.server` file
  - We've set you up with two example subscription product environment variables, `STRIPE_HOBBY_SUBSCRIPTION_PRICE_ID=` and `STRIPE_PRO_SUBSCRIPTION_PRICE_ID=`.
  - As well as a one-time payment product/credits-based environment variable, `STRIPE_CREDITS_PRICE_ID=`.
- Note that if you change the names of the price IDs, you'll need to update your server code to match these names as well

## Create a Test Customer

To create a test customer, go to the test customers url [https://dashboard.stripe.com/test/customers](https://dashboard.stripe.com/test/customers).

- Click on the `Add a customer` button and fill in the relevant information for your test customer.
:::note
 When filling in the test customer email address, use an address you have access to and will use when logging into your SaaS app. This is important because the email address is used to identify the customer when creating a subscription and allows you to manage your test user's payments/subscriptions via the test customer portal
:::

## Get your Customer Portal Link

Go to https://dashboard.stripe.com/test/settings/billing/portal in the Stripe Dashboard and activate and copy the `Customer portal link`. Paste it in your `.env.client` file:

```ts title=".env.client"
REACT_APP_STRIPE_CUSTOMER_PORTAL=<your-test-customer-portal-link>
```

Your Stripe customer portal link is imported into `src/user/AccountPage.tsx` and used to redirect users to the Stripe customer portal when they click the `Manage Subscription` button.

```tsx title="src/user/AccountPage.tsx" {5} "import.meta.env.REACT_APP_STRIPE_CUSTOMER_PORTAL"
function CustomerPortalButton() {
  const handleClick = () => {
    try {
      const schema = z.string().url();
      const customerPortalUrl = schema.parse(import.meta.env.REACT_APP_STRIPE_CUSTOMER_PORTAL);
      window.open(customerPortalUrl, '_blank');
    } catch (err) {
      console.error(err)
    }
  };
```

:::danger[Client-side Environment Variables]
Client-side environment variables, unlike server-side environment variables, should never be used to store sensitive information as they are injected at build time and are exposed to the client.
:::

## Install the Stripe CLI

To install the Stripe CLI with homebrew, run the following command in your terminal:

```sh
brew install stripe/stripe-cli/stripe
```

or for other install scripts or OSes, follow the instructions [here](https://stripe.com/docs/stripe-cli#install).

Now, let's start the webhook server and get our webhook signing secret.

First, login:
```sh
stripe login
```

:::caution[Errors running the Stripe CLI]
If you're seeing errors, consider appending `sudo` to the stripe commands.
See this [GitHuh issue](https://github.com/stripe/stripe-cli/issues/933) for more details.
:::

```sh
stripe listen --forward-to localhost:3001/stripe-webhook
```

You should see a message like this:

```sh
> Ready! You are using Stripe API Version [2023-08-16]. Your webhook signing secret is whsec_8a... (^C to quit)
```

copy this secret to your `.env.server` file under `STRIPE_WEBHOOK_SECRET=`.
