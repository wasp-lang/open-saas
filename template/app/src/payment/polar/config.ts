import { PaymentPlanId, parsePaymentPlanId, paymentPlans } from '../plans';

export interface PolarApiConfig {
  readonly accessToken: string;
  readonly organizationId: string;
  readonly webhookSecret: string;
}

export interface PolarPlanConfig {
  readonly hobbySubscriptionPlanId: string;
  readonly proSubscriptionPlanId: string;
  readonly credits10PlanId: string;
}

export interface PolarConfig {
  readonly api: PolarApiConfig;
  readonly plans: PolarPlanConfig;
}

export function getPolarConfig(): PolarConfig {
  return {
    api: getPolarApiConfig(),
    plans: getPolarPlanConfig(),
  };
}

export function getPolarApiConfig(): PolarApiConfig {
  return {
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    organizationId: process.env.POLAR_ORGANIZATION_ID!,
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  };
}

export function getPolarPlanConfig(): PolarPlanConfig {
  return {
    hobbySubscriptionPlanId: paymentPlans[PaymentPlanId.Hobby].getPaymentProcessorPlanId(),
    proSubscriptionPlanId: paymentPlans[PaymentPlanId.Pro].getPaymentProcessorPlanId(),
    credits10PlanId: paymentPlans[PaymentPlanId.Credits10].getPaymentProcessorPlanId(),
  };
}

export function mapPolarProductIdToPlanId(polarProductId: string): PaymentPlanId {
  for (const [planId, plan] of Object.entries(paymentPlans)) {
    if (plan.getPaymentProcessorPlanId() === polarProductId) {
      return planId as PaymentPlanId;
    }
  }

  throw new Error(`Unknown Polar product ID: ${polarProductId}`);
}

export function getPolarProductIdForPlan(planId: string | PaymentPlanId): string {
  const validatedPlanId = typeof planId === 'string' ? parsePaymentPlanId(planId) : planId;

  const plan = paymentPlans[validatedPlanId];
  if (!plan) {
    throw new Error(`Unknown plan ID: ${validatedPlanId}`);
  }

  return plan.getPaymentProcessorPlanId();
}
