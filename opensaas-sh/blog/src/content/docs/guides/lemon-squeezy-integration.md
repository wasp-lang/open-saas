---
title: Lemon Squeezy Integration
banner:
  content: |
    Open SaaS is now running on <a href='https://wasp-lang.dev'>Wasp v0.14</a>! <br/>🐝🚀<br/>If you're running an older version, please follow the <a href="https://wasp-lang.dev/docs/migrate-from-0-13-to-0-14">migration instructions.</a>
---

This guide will show you how to set up your Lemon Squeezy account for testing and local development.

:::note[Why use Lemon Squeezy?]
You might consider choosing Lemon Squeezy over Stripe, as Lemon Squeezy is a [Merchant of Record](https://www.lemonsqueezy.com/reporting/merchant-of-record). This means they handle the post-sale (tax) compliance for your business at slightly higher fees than Stripe.
:::

Once you deploy your app, you can follow the same steps, just make sure you're using your live Lemon Squeezy API keys and variant IDs and you are no longer in test mode within the Lemon Squeezy Dashboard.

To get started, you'll need to create a Lemon Squeezy account in test mode. You can do that [here](https://lemonsqueezy.com).

:::tip[Star our Repo on GitHub! 🌟]
We've packed in a ton of features and love into this SaaS starter, and offer it all to you for free!

If you're finding this template and its guides useful, consider giving us [a star on GitHub](https://github.com/wasp-lang/wasp)
:::

## Get your test Lemon Squeezy API Keys

Once you've created your account, you'll need to get your test API keys. You can do that by navigating to [https://app.lemonsqueezy.com/settings/api](https://app.lemonsqueezy.com/settings/api) and creating a new API key.

- Click on the `+` button
- Give your API key a name
- Copy and paste it in your `.env.server` file under `LEMONSQUEEZY_API_KEY=`

## Create Test Products

To create a test product, go to the test products url [https://app.lemonsqueezy.com/products](https://app.lemonsqueezy.com/products).

- Click on the `+ New Product` button and fill in the relevant information for your product. 
- Fill in the general information.
- For pricing, select the type of product you'd like to create, e.g. `Subscription` for a recurring monthly payment product or  `Single Payment` for credits-based product.
![test product](/lemon-squeezy/add-product.png)
- Make sure you select `Software as a service (SaaS)` as the Tax category type.
- If you want to add different price tiers for `Subscription` products, click on `add variant` under the `variants` tab. Here you can input the name of the variant (e.g. "Hobby", "Pro"), and that variant's price.
![add variant](/lemon-squeezy/add-variant.png)
- For a product with no variants, on the product page, click the `...` menu button and select `Copy variant ID`
![variant id](/lemon-squeezy/variant-id.png)
- For a product with variants, on the product page, click on the product, go to the variants tab and select `Copy ID` for each variant.
![variant ids](/lemon-squeezy/subscription-variant-ids.png)
- Paste these IDs in the `.env.server` file:
  - We've set you up with two example subscription product environment variables, `LEMONSQUEEZY_HOBBY_SUBSCRIPTION_VARIANT_ID=` and `LEMONSQUEEZY_PRO_SUBSCRIPTION_VARIANT_ID=`.
  - As well as a one-time payment product/credits-based environment variable, `LEMONSQUEEZY_CREDITS_VARIANT_ID=`.
- Note that if you change the names of the these environment variables, you'll need to update your app code to match these names as well.

## Create and Use the Lemon Squeezy Webhook in Local Development

For your app to start consuming Webhooks from Lemon Squeezy in local development, when need to create a tunnel to the locally running server. To do this, first make sure you have installed [ngrok](https://ngrok.com/docs/getting-started/).

Once installed, and with your wasp app running, run:
```sh
ngrok http 3001
```

The Wasp server will be running on port 3001, so this creates an accessbile tunnel to your server.

![ngrok](/lemon-squeezy/ngrok.png)

Ngrok will output a forwarding address for you. Copy and paste this address and add `/lemonsqueezy-webhook` to the end (this URL path has been configured for you already in `main.wasp` under the `api lemonSqueezyWebhook` definiton). It should look something like this: 

```sh title="Callback URL"
https://89e5-2003-c7-153c-72a5-f837.ngrok-free.app/lemonsqueezy-webhook
```

Now go to your [Lemon Squeezy Webhooks Dashboard](https://app.lemonsqueezy.com/settings/webhooks):
- click the `+` button.
- add the newly created webhook forwarding url to the `Callback URL` section.
- give your webhook a signing secret (a long, random string).
- copy and paste this same signing secret into your `.env.server` file under `LEMONSQUEEZY_WEBHOOK_SECRET=`
- make sure to select at least the following updates to be sent:
  - order_created
  - subscription_created
  - subscription_updated
  - subscription_cancelled
- click `save`

You're now ready to start consuming Lemon Squeezy webhook events in local development.

:::caution[Restart the Tunnel after Webhook changes]
If you make any changes to your Webhook code in `payment/lemonSqueezy/webhook.ts`, you'll need to restart ngrok for these changes to take effect via the tunnel.
:::

## Update your App code to use Lemon Squeezy instead of Stripe

There are a few places in your Wasp app where we need to switch out Stripe logic for Lemon Squeezy logic. So that you can easily find them, we've left the comment `// PAYMENTS PROCESSOR:` in the spots where you need to switch out the Stripe logic for Lemon Squeezy's. You can easily search for these comments, remove the Stripe functions, and uncomment out the Lemon Squeezy function, e.g.:

```tsx title="PricingPage.tsx" {4-6}
async function handleBuyNowClick(paymentPlanId: PaymentPlanId) {
  setIsPaymentLoading(true);

  // PAYMENTS PROCESSOR:
  const checkoutResults = await generateStripeCheckoutSession(paymentPlanId);
  // const checkoutResults = await generateLemonSqueezyCheckoutSession(paymentPlanId);
  
  if (checkoutResults?.sessionUrl) {
    window.open(checkoutResults.sessionUrl, '_self');
  } else {
    throw new Error('Error generating checkout session URL');
  }
}
```


For reference, you will find the payments processor logic in the following files:
- `PricingPage.tsx`
- `AccountPage.tsx`

And that's it. You're ready to use Lemon Squeezy as your Payment provider!


