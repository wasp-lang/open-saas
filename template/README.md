# <YOUR_APP_NAME>

This project is based on [OpenSaas](https://opensaas.sh) template and consists of three main dirs:
1. `app` - Your web app, built with [Wasp](https://wasp.sh).
2. `e2e-tests` - [Playwright](https://playwright.dev/) tests for your Wasp web app.
3. `blog` - Your blog / docs, built with [Astro](https://docs.astro.build) based on [Starlight](https://starlight.astro.build/) template.

## Payment Processors

Open SaaS supports three payment processors out of the box:
- [Stripe](https://stripe.com/)
- [Paddle](https://www.paddle.com/)
- [LemonSqueezy](https://www.lemonsqueezy.com/)

To switch between payment processors, set the `PAYMENT_PROCESSOR` environment variable:
- `PAYMENT_PROCESSOR=stripe` (default)
- `PAYMENT_PROCESSOR=paddle`
- `PAYMENT_PROCESSOR=lemonsqueezy`

For more details, check READMEs of each respective directory!
