import type { SubscriptionStatus as OpenSaasSubscriptionStatus, PaymentPlanId } from '../plans';

export interface UpdateUserPaymentDetailsArgs {
  polarCustomerId?: string;
  subscriptionPlan?: PaymentPlanId;
  subscriptionStatus?: OpenSaasSubscriptionStatus | string;
  numOfCreditsPurchased?: number;
  datePaid?: Date;
}

export interface CreatePolarCheckoutSessionArgs {
  productId: string;
  customerId: string;
}

export interface PolarCheckoutSession {
  id: string;
  url: string;
}
