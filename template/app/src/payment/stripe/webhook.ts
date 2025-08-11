import { type PrismaClient } from '@prisma/client';
import express from 'express';
import type { Stripe } from 'stripe';
import { HttpError, type MiddlewareConfigFn } from 'wasp/server';
import { type PaymentsWebhook } from 'wasp/server/api';
import { emailSender } from 'wasp/server/email';
import { requireNodeEnvVar } from '../../server/utils';
import { assertUnreachable } from '../../shared/utils';
import { UnhandledWebhookEventError } from '../errors';
import { PaymentPlanId, paymentPlans, SubscriptionStatus } from '../plans';
import { stripeClient } from './stripeClient';
import { updateUserStripePaymentDetails } from './userPaymentDetails';

export const stripeWebhook: PaymentsWebhook = async (request, response, context) => {
  const prismaUserDelegate = context.entities.User;
  try {
    const stripeEvent = constructStripeEvent(request);

    switch (stripeEvent.type) {
      case 'invoice.paid':
        await handleInvoicePaid(stripeEvent, prismaUserDelegate);
        break;
      case 'customer.subscription.updated':
        await handleCustomerSubscriptionUpdated(stripeEvent, prismaUserDelegate);
        break;
      case 'customer.subscription.deleted':
        await handleCustomerSubscriptionDeleted(stripeEvent, prismaUserDelegate);
        break;
      default:
        // If you'd like to handle more events, you can add more cases above.
        // When deploying your app, you configure your webhook in the Stripe dashboard
        // to only send the events that you're handling above.
        // See: https://docs.opensaas.sh/guides/deploying/#setting-up-your-stripe-webhook
        // In development, it is likely that you will receive other events that you are not handling.
        // These can be ignored without any issues.
        if (process.env.NODE_ENV === 'production') {
          throw new UnhandledWebhookEventError(stripeEvent.type);
        }
    }
    return response.status(204).send(); // any 2xx HTTP response is fine
  } catch (err) {
    if (err instanceof UnhandledWebhookEventError) {
      console.error('Unhandled Stripe webhook event: ', err.message);
      return response.status(422).json({ error: err.message });
    }

    console.error('Stripe webhook error:', err);
    if (err instanceof HttpError) {
      return response.status(err.statusCode).json({ error: err.message });
    } else {
      return response.status(400).json({ error: 'Error processing Stripe webhook event' });
    }
  }
};

function constructStripeEvent(request: express.Request): Stripe.Event {
  const stripeWebhookSecret = requireNodeEnvVar('STRIPE_WEBHOOK_SECRET');
  const stripeSignature = request.headers['stripe-signature'];
  if (!stripeSignature) {
    throw new HttpError(400, 'Stripe webhook signature not provided');
  }

  try {
    return stripeClient.webhooks.constructEvent(request.body, stripeSignature, stripeWebhookSecret);
  } catch (err) {
    throw new HttpError(400, 'Error constructing Stripe webhook event');
  }
}

/**
 * Stripe requires the raw request to construct the event successfully.
 * That is we we delete the Wasp's default 'express.json' middleware
 * and replace it with 'express.raw' middleware.
 */
export const stripeMiddlewareConfigFn: MiddlewareConfigFn = (middlewareConfig) => {
  middlewareConfig.delete('express.json');
  middlewareConfig.set('express.raw', express.raw({ type: 'application/json' }));
  return middlewareConfig;
};

/**
 * We create invoice both for subscriptions and one-time payments.
 * So we can handle all payment scenarios in a unified way.
 *
 * Also provides one-time payment invoices inside of the customer portal.
 */
async function handleInvoicePaid(
  event: Stripe.InvoicePaidEvent,
  prismaUserDelegate: PrismaClient['user']
): Promise<void> {
  const invoice = event.data.object;
  const customerId = getCustomerId(invoice.customer);
  const datePaid = getInvoicePaidAtDate(invoice);
  const priceId = getItemsPriceId(invoice.lines.data);
  const paymentPlanId = getPaymentPlanIdByPriceId(priceId);

  switch (paymentPlanId) {
    case PaymentPlanId.Credits10:
      updateUserStripePaymentDetails(
        { customerId, numOfCreditsPurchased: paymentPlans.credits10.effect.amount, datePaid },
        prismaUserDelegate
      );
      break;
    case PaymentPlanId.Pro:
    case PaymentPlanId.Hobby:
      updateUserStripePaymentDetails(
        {
          customerId,
          datePaid,
          paymentPlanId,
          subscriptionStatus: SubscriptionStatus.Active,
        },
        prismaUserDelegate
      );
      break;
    default:
      assertUnreachable(paymentPlanId);
  }
}

async function handleCustomerSubscriptionUpdated(
  event: Stripe.CustomerSubscriptionUpdatedEvent,
  prismaUserDelegate: PrismaClient['user']
): Promise<void> {
  const subscription = event.data.object;

  // There are other subscription statuses, such as `trialing` that we are not handling.
  // If you'd like to handle more statuses, you can add more cases below.
  // Make sure to update the `SubscriptionStatus` type in `payment/plans.ts` as well.
  let subscriptionStatus: SubscriptionStatus | undefined;
  if (subscription.status === SubscriptionStatus.Active) {
    subscriptionStatus = SubscriptionStatus.Active;
    if (subscription.cancel_at_period_end) {
      subscriptionStatus = SubscriptionStatus.CancelAtPeriodEnd;
    }
  } else if (subscription.status === SubscriptionStatus.PastDue) {
    subscriptionStatus = SubscriptionStatus.PastDue;
  } else {
    return;
  }

  const customerId = getCustomerId(subscription.customer);
  const priceId = getItemsPriceId(subscription.items.data);
  const paymentPlanId = getPaymentPlanIdByPriceId(priceId);

  const user = await updateUserStripePaymentDetails(
    { customerId, paymentPlanId, subscriptionStatus },
    prismaUserDelegate
  );

  if (subscription.cancel_at_period_end) {
    if (user.email) {
      await emailSender.send({
        to: user.email,
        subject: 'We hate to see you go :(',
        text: 'We hate to see you go. Here is a sweet offer...',
        html: 'We hate to see you go. Here is a sweet offer...',
      });
    }
  }
}

async function handleCustomerSubscriptionDeleted(
  event: Stripe.CustomerSubscriptionDeletedEvent,
  prismaUserDelegate: PrismaClient['user']
): Promise<void> {
  const subscription = event.data.object;
  const customerId = getCustomerId(subscription.customer);

  updateUserStripePaymentDetails(
    { customerId, subscriptionStatus: SubscriptionStatus.Deleted },
    prismaUserDelegate
  );
}

function getCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
): Stripe.Customer['id'] {
  if (!customer) {
    throw new Error('Customer is missing');
  } else if (typeof customer === 'string') {
    return customer;
  } else {
    return customer.id;
  }
}

function getInvoicePaidAtDate(invoice: Stripe.Invoice): Date {
  if (!invoice.status_transitions.paid_at) {
    throw new Error('Invoice has not been paid yet');
  }

  // Stripe returns timestamps in seconds (Unix time),
  // so we multiply by 1000 to convert to milliseconds.
  return new Date(invoice.status_transitions.paid_at * 1000);
}

/**
 * We only expect one line item, but if you set up a product with multiple prices, you should change this function to handle them.
 */
function getItemsPriceId(items: Stripe.InvoiceLineItem[] | Stripe.SubscriptionItem[]): Stripe.Price['id'] {
  if (items.length === 0) {
    throw new HttpError(400, 'No items in stripe event object');
  }
  if (items.length > 1) {
    throw new HttpError(400, 'More than one item in stripe event object');
  }

  const item = items[0];

  // SubscriptionItem
  if ('price' in item && item.price?.id) {
    return item.price.id;
  }

  // InvoiceLineItem
  if ('pricing' in item) {
    const priceId = item.pricing?.price_details?.price;
    if (priceId) {
      return priceId;
    }
  }

  throw new Error('Unable to extract price id from items');
}

function getPaymentPlanIdByPriceId(priceId: string): PaymentPlanId {
  const planId = Object.values(PaymentPlanId).find(
    (planId) => paymentPlans[planId].getPaymentProcessorPlanId() === priceId
  );
  if (!planId) {
    throw new Error(`No payment plan with Stripe price id ${priceId}`);
  }
  return planId;
}
