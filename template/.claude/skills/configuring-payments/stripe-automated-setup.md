# Stripe Automated Setup via CLI

Use these scripts and instructions to automate Stripe setup via CLI.
Important: never edit any .env files, always ask the user to add the values!

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

### Step 1: Select Your Stripe Account/Workspace

**Important:** If you have multiple Stripe business accounts or workspaces, you MUST select the correct one BEFORE logging in to CLI. This ensures test products are created in the right workspace.

1. Go to https://dashboard.stripe.com
2. Click your account name in the **top left corner**
3. Select the correct business/workspace for this project
4. (Optional) If you need a new workspace, click **"+ New account"** and set it up
5. **Stay logged in** with this account selected

### Step 2: Install Stripe CLI

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

### Step 3: Login to Stripe CLI

```bash
stripe login
```

This will open your browser. Authorize the CLI with the account you selected in Step 1.

### Step 4: Verify Correct Account is Connected

After login, run:
```bash
stripe config --list
```

Prompt the user to confirm that the following are correct:
- [ ] Account ID
- [ ] Display Name
- [ ] Project Name
Prompt: "Does this match the Stripe workspace you selected in Step 1? If not, please log out and log back in with the correct project name."

**⚠️ IMPORTANT:** The `test_mode_api_key` shown in `stripe config --list` is a **temporary CLI session key**, NOT your actual Stripe API key. Do NOT use this key in `.env.server`. You must get the real API key from the Stripe Dashboard (see Step 1 below).

If the account is wrong, follow these steps:

1. Log out:
   ```bash
   stripe logout
   ```

2. Prompt user to go to https://dashboard.stripe.com and select the correct workspace (top left corner)

3. Log back in:
   ```bash
   stripe login
   ```

4. Verify again:
   ```bash
   stripe config --list
   ```

## Automated Setup Process

### Step 1: Get API Key from Dashboard

**⚠️ CRITICAL:** You must get the API key from the Stripe Dashboard, NOT from `stripe config --list`. The CLI's `test_mode_api_key` is a temporary session key that won't work for your application.

Open the Stripe API keys page:
```bash
stripe open dashboard/apikeys
```

This opens your browser to the API keys page. Look for the **Secret key** (starts with `sk_test_` for test mode). Click "Reveal test key" if needed, then copy it.

Instruct the user to add to `.env.server`:
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
