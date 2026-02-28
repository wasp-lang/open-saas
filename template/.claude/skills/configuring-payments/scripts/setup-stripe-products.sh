#!/bin/bash
# Setup Stripe products and prices for Open SaaS
# Usage: ./setup-stripe-products.sh [app-name] [hobby-price] [pro-price] [credits-price]
# Example: ./setup-stripe-products.sh "My SaaS" 999 1999 1499

set -e

# Default values
APP_NAME="${1:-My Open SaaS App}"
HOBBY_PRICE="${2:-999}"  # $9.99 in cents
PRO_PRICE="${3:-1999}"   # $19.99 in cents
CREDITS_PRICE="${4:-1499}" # $14.99 in cents

echo "🚀 Creating Stripe products for: $APP_NAME"
echo "   Hobby: \$$(echo "scale=2; $HOBBY_PRICE/100" | bc)/month"
echo "   Pro: \$$(echo "scale=2; $PRO_PRICE/100" | bc)/month"
echo "   Credits: \$$(echo "scale=2; $CREDITS_PRICE/100" | bc)"
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI not found. Install it first:"
    echo "   macOS: brew install stripe/stripe-cli/stripe"
    echo "   Other: https://stripe.com/docs/stripe-cli"
    exit 1
fi

# Check if logged in
if ! stripe config --list &> /dev/null; then
    echo "❌ Not logged in to Stripe. Run: stripe login"
    exit 1
fi

echo "✅ Stripe CLI ready"
echo ""

# Create Hobby subscription product
echo "Creating Hobby subscription..."
HOBBY_PRODUCT=$(stripe products create \
  --name "$APP_NAME - Hobby" \
  --description "Hobby tier subscription" \
  --format json | grep -o '"id": *"[^"]*"' | head -1 | grep -o 'prod_[^"]*')

HOBBY_PRICE_ID=$(stripe prices create \
  --product "$HOBBY_PRODUCT" \
  --currency usd \
  --unit-amount "$HOBBY_PRICE" \
  --recurring[interval]=month \
  --format json | grep -o '"id": *"[^"]*"' | head -1 | grep -o 'price_[^"]*')

echo "   ✅ Hobby Plan Price ID: $HOBBY_PRICE_ID"

# Create Pro subscription product
echo "Creating Pro subscription..."
PRO_PRODUCT=$(stripe products create \
  --name "$APP_NAME - Pro" \
  --description "Pro tier subscription with premium features" \
  --format json | grep -o '"id": *"[^"]*"' | head -1 | grep -o 'prod_[^"]*')

PRO_PRICE_ID=$(stripe prices create \
  --product "$PRO_PRODUCT" \
  --currency usd \
  --unit-amount "$PRO_PRICE" \
  --recurring[interval]=month \
  --format json | grep -o '"id": *"[^"]*"' | head -1 | grep -o 'price_[^"]*')

echo "   ✅ Pro Plan Price ID: $PRO_PRICE_ID"

# Create Credits one-time product
echo "Creating Credits package..."
CREDITS_PRODUCT=$(stripe products create \
  --name "$APP_NAME - 10 Credits" \
  --description "10 credits for one-time purchase" \
  --format json | grep -o '"id": *"[^"]*"' | head -1 | grep -o 'prod_[^"]*')

CREDITS_PRICE_ID=$(stripe prices create \
  --product "$CREDITS_PRODUCT" \
  --currency usd \
  --unit-amount "$CREDITS_PRICE" \
  --format json | grep -o '"id": *"[^"]*"' | head -1 | grep -o 'price_[^"]*')

echo "   ✅ Credits Price ID: $CREDITS_PRICE_ID"
echo ""

# Output summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All products created successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Add these to your .env.server file:"
echo ""
echo "PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID=$HOBBY_PRICE_ID"
echo "PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID=$PRO_PRICE_ID"
echo "PAYMENTS_CREDITS_10_PLAN_ID=$CREDITS_PRICE_ID"
echo ""
echo "Next steps:"
echo "1. Copy the above variables to your .env.server"
echo "2. Get your API key: stripe keys list"
echo "3. Add STRIPE_API_KEY to .env.server"
echo "4. Start webhook forwarding: stripe listen --forward-to localhost:3001/payments-webhook"
echo "5. Add the webhook secret to .env.server"
echo ""
