import { emailSender } from 'wasp/server/email';
import { type MiddlewareConfigFn } from 'wasp/server';
import { type StripeWebhook } from 'wasp/server/api';
import express from 'express';
import { TierIds } from '../../shared/constants.js';

import Stripe from 'stripe';

// make sure the api version matches the version in the Stripe dashboard
const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: '2022-11-15', // TODO find out where this is in the Stripe dashboard and document
});

export const stripeWebhook: StripeWebhook = async (request, response, context) => {
  const sig = request.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    // console.table({sig: 'stripe webhook signature verified', type: event.type})
  } catch (err: any) {
    console.log(err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // let event: Stripe.Event;
  let userStripeId: string | null = null;

  try {
    if (event.type === 'checkout.session.completed') {
      console.log('Checkout session completed');
      const session = event.data.object as Stripe.Checkout.Session;
      userStripeId = session.customer as string;

      const { line_items } = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items'],
      });

      if (line_items?.data[0]?.price?.id === process.env.HOBBY_SUBSCRIPTION_PRICE_ID) {
        console.log('Hobby subscription purchased ');
        await context.entities.User.updateMany({
          where: {
            stripeId: userStripeId,
          },
          data: {
            hasPaid: true,
            datePaid: new Date(),
            subscriptionTier: TierIds.HOBBY,
          },
        });
      } else if (line_items?.data[0]?.price?.id === process.env.PRO_SUBSCRIPTION_PRICE_ID) {
        console.log('Pro subscription purchased ');
        await context.entities.User.updateMany({
          where: {
            stripeId: userStripeId,
          },
          data: {
            hasPaid: true,
            datePaid: new Date(),
            subscriptionTier: TierIds.PRO,
          },
        });
      }

      /**
       * and here is an example of handling a product that is not a subscription
       * in this case, we are adding 10 credits to the user's account
       * make sure to configure it in the Stripe dashboard first!
       */

      // if (line_items?.data[0]?.price?.id === process.env.CREDITS_PRICE_ID) {
      //   console.log('Credits purchased: ');
      //   await context.entities.User.updateMany({
      //     where: {
      //       stripeId: userStripeId,
      //     },
      //     data: {
      //       credits: {
      //         increment: 10,
      //       },
      //     },
      //   });
      // }
    } else if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice;
      const periodStart = new Date(invoice.period_start * 1000);
      await context.entities.User.updateMany({
        where: {
          stripeId: userStripeId,
        },
        data: {
          hasPaid: true,
          datePaid: periodStart,
        },
      });
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      userStripeId = subscription.customer as string;
      if (subscription.status === 'active') {
        console.log('Subscription active ', userStripeId);
        await context.entities.User.updateMany({
          where: {
            stripeId: userStripeId,
          },
          data: {
            subscriptionStatus: 'active',
          },
        });
      }
      // you'll want to make a check on the front end to see if the subscription is past due
      // and then prompt the user to update their payment method
      // this is useful if the user's card expires or is canceled and automatic subscription renewal fails
      if (subscription.status === 'past_due') {
        console.log('Subscription past due: ', userStripeId);
        await context.entities.User.updateMany({
          where: {
            stripeId: userStripeId,
          },
          data: {
            subscriptionStatus: 'past_due',
          },
        });
      }
      /**
       * Stripe will send a subscription.updated event when a subscription is canceled
       * but the subscription is still active until the end of the period.
       * So we check if cancel_at_period_end is true and send an email to the customer.
       * https://stripe.com/docs/billing/subscriptions/cancel#events
       */
      if (subscription.cancel_at_period_end) {
        console.log('Subscription canceled at period end');

        let customer = await context.entities.User.findFirst({
          where: {
            stripeId: userStripeId,
          },
          select: {
            id: true,
            email: true,
          },
        });

        if (customer) {
          await context.entities.User.update({
            where: {
              id: customer.id,
            },
            data: {
              subscriptionStatus: 'canceled',
            },
          });

          if (customer.email) {
            await emailSender.send({
              to: customer.email,
              subject: 'We hate to see you go :(',
              text: 'We hate to see you go. Here is a sweet offer...',
              html: 'We hate to see you go. Here is a sweet offer...',
            });
          }
        }
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      userStripeId = subscription.customer as string;

      /**
       * Stripe will send then finally send a subscription.deleted event when subscription period ends
       * https://stripe.com/docs/billing/subscriptions/cancel#events
       */
      console.log('Subscription deleted/ended');
      await context.entities.User.updateMany({
        where: {
          stripeId: userStripeId,
        },
        data: {
          hasPaid: false,
          subscriptionStatus: 'deleted',
        },
      });
    } else {
      console.log(`Unhandled event type ${event.type}`);
    }

    response.json({ received: true });
  } catch (err: any) {
    response.status(400).send(`Webhook Error: ${err?.message}`);
  }
};

// This allows us to override Wasp's defaults and parse the raw body of the request from Stripe to verify the signature
export const stripeMiddlewareFn: MiddlewareConfigFn = (middlewareConfig) => {
  middlewareConfig.delete('express.json');
  middlewareConfig.set('express.raw', express.raw({ type: 'application/json' }));
  return middlewareConfig;
};
