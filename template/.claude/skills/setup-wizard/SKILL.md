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
- Email/password (enabled by default)
- Google OAuth
- GitHub OAuth
- Discord OAuth
- Slack OAuth
- Keycloak OAuth

For each OAuth provider selected:
1. uncomment or add the provider in wasp config file auth methods
2. inform user they'll need to set env vars later (Step 6)

Refer to [configuring-auth skill](../configuring-auth/SKILL.md) for details.

### Step 3: Payment Provider

Ask the user:
- Which payment provider? (Stripe / Lemon Squeezy / Polar / Skip for now)

If they choose one:
1. update `src/payment/paymentProcessor.ts` to select their provider
2. note they'll configure credentials in Step 6

Refer to [configuring-payments skill](../configuring-payments/SKILL.md) for details.

### Step 4: Email Provider

Ask the user:
- Which email provider for production? (SendGrid / Mailgun / SMTP / Skip for now)

If they choose one:
1. update `emailSender.provider` in wasp config file
2. note they'll configure credentials in Step 6

For development, explain `Dummy` provider shows emails in console.

### Step 5: Analytics (Optional)

Ask the user:
- Want to set up analytics? (Plausible / Google Analytics / Skip)

If yes, note they'll add tracking ID in Step 6.

### Step 6: Environment Variables

Generate a checklist of required env vars based on their selections:

```
# Based on your setup, you need these in .env.server:

# Database (required)
DATABASE_URL=

# Auth - OAuth (if selected)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
# ... etc based on selections

# Payments (if selected)
STRIPE_API_KEY=
# ... etc based on selection

# Email (if selected)
SENDGRID_API_KEY=
# ... etc based on selection
```

Ask: "Would you like me to create a .env.server template with these variables?"

### Step 7: Verify Setup

Refer to [starting-wasp skill](../starting-wasp/SKILL.md) for details on how to start the development server.
1. after starting the development server, verify configuration compiles
2. check for any errors
3. summarize what was configured and what still needs credentials

## Completion

Provide a summary:
- What was configured
- What env vars still need to be filled in
- Links to provider dashboards for obtaining credentials
- Links to [Open SaaS docs](https://docs.opensaas.sh) for completing integrations
- Prompt the user if they'd like help with further setup for full functionality of the features they selected.

### Further Setup Help

- For payments, run the [configuring-payments skill](../configuring-payments/SKILL.md) for further setup.
- For auth, run the [configuring-auth skill](../configuring-auth/SKILL.md) for further setup.
- For features, run the [adding-feature skill](../adding-feature/SKILL.md) for further setup.

## Documentation

Fetch guide URLs directly:
- https://docs.opensaas.sh/llms.txt

If you need more specific info, use mcp__wasp-docs__find_docs to search.
