import type { ServerSetupFnContext } from '@wasp/types';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { emailSender } from '@wasp/jobs/emailSender.js';
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

export const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: '2022-11-15',
});

/** 🪝 Server Setup
 * This is a custom API endpoint that is used to handle Stripe webhooks.
 * Wasp will setup all the other endpoints for you automatically
 * based on your queries and actions in the main.wasp file 🎉
 */

export default async function ({ app, server }: ServerSetupFnContext) {
  // this just tests that the sendgrid worker is working correctly
  // it can be removed here after sendgrid is properly configured

  // await emailSender.submit({
  //   to: 'your@email.com',
  //   subject: 'Test',
  //   text: 'Test',
  //   html: 'Test',
  // });

  app.post('/stripe-webhook', async (request, response) => {
    if (process.env.NODE_ENV === 'production') {
      const detectedIp = requestIp.getClientIp(request) as string;
      const isStripeIP = STRIPE_WEBHOOK_IPS.includes(detectedIp);

      if (!isStripeIP) {
        console.log('IP address not from Stripe: ', detectedIp);
        return response.status(403).json({ received: false });
      }
    }

    let event: Stripe.Event = request.body;
    let userStripeId: string | null = null;
    // console.log('event', event)

    if (event.type === 'invoice.paid') {
      const charge = event.data.object as Stripe.Invoice;
      userStripeId = charge.customer as string;

      if (charge.amount_paid === 999) {
        console.log('Subscription purchased: ', charge.amount_paid);
        await prisma.user.updateMany({
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
        await prisma.user.updateMany({
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
        const customerEmail = await prisma.user.findFirst({
          where: {
            stripeId: userStripeId,
          },
          select: {
            email: true,
          },
        });

        if (customerEmail) {
          await emailSender.submit({
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
      await prisma.user.updateMany({
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

    // Return a 200 response to acknowledge receipt of the event
    response.json({ received: true });
  });
}
