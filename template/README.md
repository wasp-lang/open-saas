# <YOUR_APP_NAME>

This project is based on [OpenSaas](https://opensaas.sh) template and consists of three main dirs:
1. `app` - Your web app, built with [Wasp](https://wasp.sh).
2. `e2e-tests` - [Playwright](https://playwright.dev/) tests for your Wasp web app.
3. `blog` - Your blog / docs, built with [Astro](https://docs.astro.build) based on [Starlight](https://starlight.astro.build/) template.

## Payment Processors

Open SaaS supports three payment processors out of the box:

### Stripe
The most popular payment processor with extensive features and global reach.

### Lemon Squeezy
Great for digital products with built-in tax handling and global compliance.

### Paddle
A comprehensive payment solution with built-in tax handling, subscription management, and global compliance.

To switch between payment processors, set the `PAYMENT_PROCESSOR` environment variable:
- `PAYMENT_PROCESSOR=stripe` (default)
- `PAYMENT_PROCESSOR=lemonsqueezy`
- `PAYMENT_PROCESSOR=paddle`

Each processor has its own configuration file:
- `.env.server.example` - Default Stripe configuration

For more details, check READMEs of each respective directory!
