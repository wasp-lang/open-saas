# Polar Payment Processor Integration

This directory contains the Polar payment processor integration for OpenSaaS.

## Environment Variables

The following environment variables are required when using Polar as your payment processor:

### Core Configuration
```bash
PAYMENT_PROCESSOR_ID=polar  # Select Polar as the active payment processor
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_ORGANIZATION_ID=your_polar_organization_id  
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
POLAR_CUSTOMER_PORTAL_URL=your_polar_customer_portal_url
```

### Product/Plan Mappings
```bash
POLAR_HOBBY_SUBSCRIPTION_PLAN_ID=your_hobby_plan_id
POLAR_PRO_SUBSCRIPTION_PLAN_ID=your_pro_plan_id  
POLAR_CREDITS_10_PLAN_ID=your_credits_plan_id
```

### Optional Configuration
```bash
POLAR_SANDBOX_MODE=true  # Override sandbox mode (defaults to NODE_ENV-based detection)
```

## Integration with Existing Payment Plan Infrastructure

This Polar integration **maximizes reuse** of the existing OpenSaaS payment plan infrastructure for consistency and maintainability.

### Reused Components

#### **PaymentPlanId Enum**
- Uses the existing `PaymentPlanId` enum from `src/payment/plans.ts`
- Ensures consistent plan identifiers across all payment processors
- Values: `PaymentPlanId.Hobby`, `PaymentPlanId.Pro`, `PaymentPlanId.Credits10`

#### **Plan ID Validation**
- Leverages existing `parsePaymentPlanId()` function for input validation
- Provides consistent error handling for invalid plan IDs
- Maintains compatibility with existing plan validation logic

#### **Type Safety**
- All plan-related functions use `PaymentPlanId` enum types instead of strings
- Ensures compile-time safety when working with payment plans
- Consistent with other payment processor implementations

### Plan ID Mapping Functions

```typescript
import { PaymentPlanId } from '../plans';

// Maps Polar product ID to PaymentPlanId enum
function mapPolarProductIdToPlanId(polarProductId: string): PaymentPlanId {
  // Returns PaymentPlanId.Hobby, PaymentPlanId.Pro, or PaymentPlanId.Credits10
}

// Maps PaymentPlanId enum to Polar product ID
function getPolarProductIdForPlan(planId: string | PaymentPlanId): string {
  // Accepts both string and enum, validates using existing parsePaymentPlanId()
}
```

### Benefits of Integration

1. **Consistency**: All payment processors use the same plan identifiers
2. **Type Safety**: Compile-time validation of plan IDs throughout the system
3. **Maintainability**: Single source of truth for payment plan definitions
4. **Validation**: Leverages existing validation logic for plan IDs
5. **Future-Proof**: Easy to add new plans or modify existing ones

## Environment Variable Validation

This integration uses **Wasp's centralized Zod-based environment variable validation** for type safety and comprehensive error handling.

### How Validation Works

1. **Schema Definition**: All Polar environment variables are defined with Zod schemas in `src/server/env.ts`
2. **Format Validation**: Each variable includes specific validation rules:
   - `POLAR_ACCESS_TOKEN`: Minimum 10 characters
   - `POLAR_WEBHOOK_SECRET`: Minimum 8 characters for security
   - `POLAR_CUSTOMER_PORTAL_URL`: Must be a valid URL
   - Product IDs: Alphanumeric characters, hyphens, and underscores only
3. **Conditional Validation**: Variables are only validated when `PAYMENT_PROCESSOR_ID=polar`
4. **Startup Validation**: Validation occurs automatically when configuration is accessed

### Validation Features

- ✅ **Type Safety**: All environment variables are properly typed
- ✅ **Format Validation**: URL validation, length checks, character restrictions
- ✅ **Conditional Logic**: Only validates when Polar is the selected processor
- ✅ **Detailed Error Messages**: Clear feedback on what's missing or invalid
- ✅ **Optional Variables**: Sandbox mode and other optional settings
- ✅ **Centralized**: Single source of truth for all validation logic

### Usage in Code

The validation is integrated into the configuration loading:

```typescript
import { getPolarConfig, validatePolarConfig } from './config';

// Automatic validation when accessing config
const config = getPolarConfig(); // Validates automatically

// Manual validation with optional force flag
validatePolarConfig(true); // Force validation regardless of processor selection
```

## Configuration Access

### API Configuration
```typescript
import { getPolarApiConfig } from './config';

const apiConfig = getPolarApiConfig();
// Returns: { accessToken, organizationId, webhookSecret, customerPortalUrl, sandboxMode }
```

### Plan Configuration
```typescript
import { getPolarPlanConfig } from './config';

const planConfig = getPolarPlanConfig();
// Returns: { hobbySubscriptionPlanId, proSubscriptionPlanId, credits10PlanId }
```

### Complete Configuration
```typescript
import { getPolarConfig } from './config';

const config = getPolarConfig();
// Returns: { api: {...}, plans: {...} }
```

### Plan ID Mapping
```typescript
import { mapPolarProductIdToPlanId, getPolarProductIdForPlan } from './config';
import { PaymentPlanId } from '../plans';

// Convert Polar product ID to OpenSaaS plan ID
const planId: PaymentPlanId = mapPolarProductIdToPlanId('polar_product_123');

// Convert OpenSaaS plan ID to Polar product ID
const productId: string = getPolarProductIdForPlan(PaymentPlanId.Hobby);
// or with string validation
const productId2: string = getPolarProductIdForPlan('hobby'); // Validates input
```

## Sandbox Mode Detection

The integration automatically detects sandbox mode using the following priority:

1. **`POLAR_SANDBOX_MODE`** environment variable (`true`/`false`)
2. **`NODE_ENV`** fallback (sandbox unless `NODE_ENV=production`)

## Error Handling

The validation system provides comprehensive error messages:

```bash
❌ Environment variable validation failed:
1. POLAR_ACCESS_TOKEN: POLAR_ACCESS_TOKEN must be at least 10 characters long
2. POLAR_CUSTOMER_PORTAL_URL: POLAR_CUSTOMER_PORTAL_URL must be a valid URL
```

## Integration with Wasp

This validation integrates seamlessly with Wasp's environment variable system:

- **Server Startup**: Validation runs automatically when the configuration is first accessed
- **Development**: Clear error messages help identify configuration issues quickly  
- **Production**: Prevents deployment with invalid configuration
- **Type Safety**: Full TypeScript support for all environment variables

## Best Practices

1. **Set Required Variables**: Ensure all core configuration variables are set
2. **Use .env.server**: Store sensitive variables in your `.env.server` file
3. **Validate Early**: The system validates automatically, but you can force validation for testing
4. **Check Logs**: Watch for validation success/failure messages during startup
5. **Handle Errors**: Validation errors will prevent application startup with invalid config
6. **Use Type Safety**: Leverage PaymentPlanId enum for compile-time safety

## Troubleshooting

### Common Issues

1. **Missing Variables**: Check that all required variables are set in `.env.server`
2. **Invalid URLs**: Ensure `POLAR_CUSTOMER_PORTAL_URL` includes protocol (`https://`)
3. **Wrong Processor**: Set `PAYMENT_PROCESSOR_ID=polar` to enable validation
4. **Token Format**: Ensure access tokens are at least 10 characters long
5. **Plan ID Errors**: Use PaymentPlanId enum values or valid string equivalents

### Debug Validation

To test validation manually:

```typescript
import { validatePolarConfig } from './config';

// Force validation regardless of processor selection
try {
  validatePolarConfig(true);
  console.log('✅ Validation passed');
} catch (error) {
  console.error('❌ Validation failed:', error.message);
}
```

### Plan ID Debugging

To debug plan ID mapping:

```typescript
import { mapPolarProductIdToPlanId, getPolarProductIdForPlan } from './config';
import { PaymentPlanId } from '../plans';

// Test product ID to plan ID mapping
try {
  const planId = mapPolarProductIdToPlanId('your_polar_product_id');
  console.log('Plan ID:', planId); // Will be PaymentPlanId.Hobby, etc.
} catch (error) {
  console.error('Unknown product ID:', error.message);
}

// Test plan ID to product ID mapping
try {
  const productId = getPolarProductIdForPlan(PaymentPlanId.Hobby);
  console.log('Product ID:', productId);
} catch (error) {
  console.error('Invalid plan ID:', error.message);
}
``` 