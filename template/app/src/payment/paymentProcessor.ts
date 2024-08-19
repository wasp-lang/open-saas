import type { PaymentPlan } from './plans';
import { stripePaymentProcessor } from './stripe/stripePaymentProcessor';
import { lsPaymentProcessor } from './lemonSqueezy/lsPaymentProcessor';

interface PaymentProcessor {
  createCheckoutSession: ({
    userId,
    userEmail,
    paymentPlan,
  }: {
    userId: string | undefined;
    userEmail: string;
    paymentPlan: PaymentPlan;
  }) => Promise<{ session: {  id: string; url: string }; customer?: { id: string } }>;
}

export const paymentProcessor: PaymentProcessor = lsPaymentProcessor;
