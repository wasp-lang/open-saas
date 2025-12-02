# Stripe Automated Setup via CLI

Use these scripts and instructions to automate Stripe setup via CLI.

## When to Use This

Use CLI automation when:
- User explicitly asks for CLI/automated setup
- User is comfortable with command-line tools
- Setting up Stripe for the first time
- Need to quickly create test products

Use manual setup (dashboard) when:
- User prefers GUI
- User needs custom product configurations
- Setting up production (review each setting)

## Prerequisites

Check if Stripe CLI is installed:
```bash
stripe --version
```

If not installed:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux/Windows
# Download from: https://stripe.com/docs/stripe-cli
```

Login to Stripe:
```bash
stripe login
```

## Automated Setup Process

### Step 1: Get API Key

Open the Stripe API keys page and get your test key (starts with `sk_test_`):
```bash
stripe open dashboard/apikeys
```

Help user add to `.env.server`:
```bash
STRIPE_API_KEY=sk_test_51ABC...
```

### Step 2: Create Products

Run the product setup script:
```bash
cd .claude/skills/configuring-payments
chmod +x setup-stripe-products.sh

# Basic usage - use app name from main.wasp
./setup-stripe-products.sh "App Name"

# Custom pricing (in cents): hobby pro credits
./setup-stripe-products.sh "App Name" 999 1999 1499
```

The script will output Price IDs. Help user add to `.env.server`:
```bash
PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID=price_1ABC...
PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID=price_1DEF...
PAYMENTS_CREDITS_10_PLAN_ID=price_1GHI...
```

### Step 3: Setup Webhook

Instruct user to open a **separate terminal** and run:
```bash
stripe listen --forward-to localhost:3001/payments-webhook
```

This outputs a webhook secret (starts with `whsec_`). Help user add to `.env.server`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_ABC123...
```

**Important:** This terminal must stay open during development.

### Step 4: Verify Configuration

Run the verification script:
```bash
cd .claude/skills/configuring-payments
chmod +x check-stripe-config.sh
./check-stripe-config.sh
```

Review output with user and fix any issues.

### Step 5: Restart Wasp Server

Server should auto-restart when `.env.server` changes. If not:
```bash
# Stop current server (Ctrl+C) and restart
wasp start
```

## Testing Payments and Troubleshooting

See [troubleshooting](./troubleshooting.md) for common issues and how to fix them.
