#!/bin/bash
# Check Stripe configuration status for Open SaaS
# Usage: ./check-stripe-config.sh [path-to-env-file]

set -e

ENV_FILE="${1:-.env.server}"

echo "🔍 Checking Stripe Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Stripe CLI
echo "1. Stripe CLI"
if command -v stripe &> /dev/null; then
    echo "   ✅ Stripe CLI installed"

    if stripe config --list &> /dev/null 2>&1; then
        echo "   ✅ Authenticated"
        ACCOUNT=$(stripe config --list 2>/dev/null | grep "account_id" | awk '{print $2}')
        echo "   📋 Account: $ACCOUNT"
    else
        echo "   ⚠️  Not logged in. Run: stripe login"
    fi
else
    echo "   ❌ Stripe CLI not installed"
    echo "      Install: brew install stripe/stripe-cli/stripe"
fi

echo ""

# Check .env.server file
echo "2. Environment Variables ($ENV_FILE)"
if [ -f "$ENV_FILE" ]; then
    echo "   ✅ File exists"

    # Check API Key
    if grep -q "^STRIPE_API_KEY=sk_test_" "$ENV_FILE" 2>/dev/null; then
        echo "   ✅ STRIPE_API_KEY configured"
    elif grep -q "^STRIPE_API_KEY=sk_live_" "$ENV_FILE" 2>/dev/null; then
        echo "   ⚠️  STRIPE_API_KEY is LIVE mode (use test mode for development)"
    else
        echo "   ❌ STRIPE_API_KEY missing or invalid"
    fi

    # Check Webhook Secret
    if grep -q "^STRIPE_WEBHOOK_SECRET=whsec_" "$ENV_FILE" 2>/dev/null; then
        echo "   ✅ STRIPE_WEBHOOK_SECRET configured"
    else
        echo "   ⚠️  STRIPE_WEBHOOK_SECRET missing"
        echo "      Run: stripe listen --forward-to localhost:3001/payments-webhook"
    fi

    # Check Product IDs
    if grep -q "^PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID=price_" "$ENV_FILE" 2>/dev/null; then
        echo "   ✅ PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID configured"
    else
        echo "   ❌ PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID missing"
    fi

    if grep -q "^PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID=price_" "$ENV_FILE" 2>/dev/null; then
        echo "   ✅ PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID configured"
    else
        echo "   ❌ PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID missing"
    fi

    if grep -q "^PAYMENTS_CREDITS_10_PLAN_ID=price_" "$ENV_FILE" 2>/dev/null; then
        echo "   ✅ PAYMENTS_CREDITS_10_PLAN_ID configured"
    else
        echo "   ❌ PAYMENTS_CREDITS_10_PLAN_ID missing"
    fi
else
    echo "   ❌ $ENV_FILE not found"
fi

echo ""

# Check if server is running
echo "3. Webhook Endpoint"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/payments-webhook 2>/dev/null | grep -q "200\|404\|405"; then
    echo "   ✅ Server responding on port 3001"
else
    echo "   ⚠️  Server not responding on port 3001"
    echo "      Start with: wasp start"
fi

echo ""

# List products if CLI is available
if command -v stripe &> /dev/null && stripe config --list &> /dev/null 2>&1; then
    echo "4. Stripe Products"
    echo "   Fetching products..."
    PRODUCTS=$(stripe products list --limit 5 2>/dev/null)

    if [ $? -eq 0 ]; then
        echo "$PRODUCTS" | grep -E "id|name" | head -10
    else
        echo "   ⚠️  Could not fetch products"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Quick commands:"
echo "  • View products:  stripe products list"
echo "  • View prices:    stripe prices list"
echo "  • Test webhook:   stripe trigger checkout.session.completed"
echo "  • View events:    stripe events list --limit 10"
echo "  • Open dashboard: stripe dashboard"
echo ""
