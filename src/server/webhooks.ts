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
  response.set('Access-Control-Allow-Origin', '*'); // Example of modifying headers to override Wasp default CORS middleware.

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

    if (event.type === 'invoice.paid') {
      const charge = event.data.object as Stripe.Invoice;
      userStripeId = charge.customer as string;

      if (charge.amount_paid === 999) {
        console.log('Subscription purchased: ', charge.amount_paid);
        await context.entities.User.updateMany({
          where: {
            stripeId: userStripeId,
          },
          data: {
            hasPaid: true,
          },
        });
      }

      if (charge.amount_paid === 295) {
        console.log('Credits purchased: ', charge.amount_paid);
        await context.entities.User.updateMany({
          where: {
            stripeId: userStripeId,
          },
          data: {
            credits: {
              increment: 10,
            },
          },
        });
      }
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      userStripeId = subscription.customer as string;

      if (subscription.cancel_at_period_end) {
        const customerEmail = await context.entities.User.findFirst({
          where: {
            stripeId: userStripeId,
          },
          select: {
            email: true,
          },
        });

        if (customerEmail) {
          await emailSender.send({
            to: customerEmail.email,
            subject: 'We hate to see you go :(',
            text: 'We hate to see you go. Here is a sweet offer...',
            html: 'We hate to see you go. Here is a sweet offer...',
          });
        }
      }
    } else if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.canceled') {
      const subscription = event.data.object as Stripe.Subscription;
      userStripeId = subscription.customer as string;

      console.log('Subscription canceled');
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
