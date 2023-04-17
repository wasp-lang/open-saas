import { StripeWebhook } from '@wasp/apis/types';
import { emailSender } from '@wasp/email/index.js';

import Stripe from 'stripe';
import requestIp from 'request-ip';

export const STRIPE_WEBHOOK_IPS = [
  '3.18.12.63',
  '3.130.192.231',
  '13.235.14.237',
  '13.235.122.149',
  '18.211.135.69',
  '35.154.171.200',
  '52.15.183.38',
  '54.88.130.119',
  '54.88.130.237',
  '54.187.174.169',
  '54.187.205.235',
  '54.187.216.72',
];

const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: '2022-11-15',
});

export const stripeWebhook: StripeWebhook = async (request, response, context) => {

  if (process.env.NODE_ENV === 'production') {
    const detectedIp = requestIp.getClientIp(request) as string;
    const isStripeIP = STRIPE_WEBHOOK_IPS.includes(detectedIp);

    if (!isStripeIP) {
      console.log('IP address not from Stripe: ', detectedIp);
      return response.status(403).json({ received: false });
    }
  }

  let event: Stripe.Event;
  let userStripeId: string | null = null;

  try {
    event = request.body;

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      userStripeId = session.customer as string;

      const { line_items } = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items'],
      });

      console.log('line_items: ', line_items);

      if (line_items?.data[0]?.price?.id === process.env.SUBSCRIPTION_PRICE_ID) {
        console.log('Subscription purchased ');
        await context.entities.User.updateMany({
          where: {
            stripeId: userStripeId,
          },
          data: {
            hasPaid: true,
          },
        });
      }

      /**
       * and here is an example of handling a different type of product
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
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      userStripeId = subscription.customer as string;

      /**
       * Stripe will send a subscription.updated event when a subscription is canceled
       * but the subscription is still active until the end of the period.
       * So we check if cancel_at_period_end is true and send an email to the customer.
       * https://stripe.com/docs/billing/subscriptions/cancel#events
       */
      if (subscription.cancel_at_period_end) {
        console.log('Subscription canceled at period end');

        const customer = await context.entities.User.findFirst({
          where: {
            stripeId: userStripeId,
          },
          select: {
            email: true,
          },
        });

        if (customer?.email) {
          await emailSender.send({
            to: customer.email,
            subject: 'We hate to see you go :(',
            text: 'We hate to see you go. Here is a sweet offer...',
            html: 'We hate to see you go. Here is a sweet offer...',
          });
        }
      }
    } else if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.canceled') {
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
