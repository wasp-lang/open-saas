---
name: setup-wizard
description: interactive guided setup for configuring a new Open SaaS project.
---

# setup-wizard

This wizard walks through essential Open SaaS configuration. Run each step in order, asking the user for decisions at each stage.

## Before Starting

1. verify user is in the app directory (check for wasp config file: `main.wasp` or `main.wasp.ts`)
2. ask: "Would you like me to guide you through setting up your Open SaaS project?"

## Setup Steps

Guide the user through these steps in order. At each step, ask for their preferences before making changes.

### Step 1: App Branding

Ask the user:
- What is your app name?
- What is a one-line description?

Then update in [`../../../app/main.wasp`](../../../app/main.wasp):
- `app.name`
- `app.title`
- `app.head` meta tags

### Step 2: Authentication

Ask the user which auth methods they want:
- Email/password (enabled by default with `Dummy` email sender for local development)
- Google OAuth (requires API keys)
- GitHub OAuth (requires API keys)
- Discord OAuth (requires API keys)
- Slack OAuth (requires API keys)
- Keycloak OAuth (requires API keys)

For each OAuth provider selected:
1. uncomment or add the provider in wasp config file auth methods
2. inform user they'll need to set env vars later (Step 6)

### Step 3: Payment Provider

Ask the user which payment provider they'd like to use:
  - Stripe (industry standard, most configurable, lower fees per transaction)
  - Polar (Merchant of Record, great DX, higher fees per transaction)
  - Lemon Squeezy (Merchant of Record, higher fees per transaction)
  - Skip for now (no payments)

If they choose one:
1. update `src/payment/paymentProcessor.ts` to select their provider
2. remove the unused payment processor code from the `src/payment/<unused-provider>` directory
3. remove unused payment provider code and clients from `src/analytics/stats.ts`
4. prompt the user to remove the unused provider variables from the `.env.server` file
5. note they'll configure their provider's credentials in Step 6

### Step 4: Email Provider

Ask the user which email provider they'd like to use:
  - SendGrid (requires API key)
  - Mailgun (requires API key)
  - SMTP (requires SMTP server credentials)
  - Skip for now (default provider is `Dummy`, which logs emails to console for local development)

If they choose one:
1. update `emailSender.provider` in wasp config file
2. note they'll configure credentials in Step 6

### Step 5: Analytics (Optional)

Ask the user if they want to set up analytics:
  - Plausible (requires API key)
  - Google Analytics (requires API key)
  - Skip for now (no analytics)

If yes, note they'll configure the analytics provider in Step 6.

### Step 6: Completing Integrations & Environment Variables

For each integration selected: follow the guide or skill → generate checklist of required env vars → give user instructions to apply → move to next.

- OAuth providers: find the correct provider guide URL at https://wasp.sh/llms.txt
- Email providers: find the sending emails guide URL at https://wasp.sh/llms.txt
- Analytics providers: find the correct guide URL at https://docs.opensaas.sh/llms.txt
- Payment providers: invoke the [configuring-payments skill](../configuring-payments/SKILL.md)

### Step 7: Verify Setup

1. "Would you like to start your Wasp app in a new terminal yourself or would you like me to start it for you as a background task?" 
2. after starting the development server, verify configuration compiles
3. check for any errors.

## Step 8: Completion

Provide a summary of the setup process and what other skills and commands are available to help with further setup.

## Documentation

Fetch guide URLs directly from the Wasp and Open SaaS docs: 
- https://wasp.sh/llms.txt
- https://docs.opensaas.sh/llms.txt  

If you need more specific info, use mcp__wasp-docs__find_docs to search.
