# <YOUR_APP_NAME>

This project is based on [Open Saas](https://opensaas.sh) template and consists of three main dirs:

1. `app` - Your web app, built with [Wasp](https://wasp.sh).
2. `e2e-tests` - [Playwright](https://playwright.dev/) tests for your Wasp web app.
3. `blog` - Your blog / docs, built with [Astro](https://docs.astro.build) based on [Starlight](https://starlight.astro.build/) template.

## Payment Processors

Open SaaS supports four payment processors out of the box:
- [Stripe](https://stripe.com/)
- [Lemon Squeezy](https://www.lemonsqueezy.com/)
- [Polar](https://polar.sh/)
- [Paddle](https://www.paddle.com/)

To choose one, set the exported `paymentProcessor` in `app/src/payment/paymentProcessor.ts`
to the processor you want, then delete the code for the ones you don't use from `app/src/payment`.

For more details, check READMEs of each respective directory!
