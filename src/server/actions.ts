import fetch from 'node-fetch';
import HttpError from '@wasp/core/HttpError.js';
import type { RelatedObject } from '@wasp/entities';
import type { GenerateGptResponse, StripePayment } from '@wasp/actions/types';
import type { StripePaymentResult, OpenAIResponse } from './types';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: '2022-11-15',
});

// WASP_WEB_CLIENT_URL will be set up by Wasp when deploying to production: https://wasp-lang.dev/docs/deploying
const DOMAIN = process.env.WASP_WEB_CLIENT_URL || 'http://localhost:3000';

export const stripePayment: StripePayment<void, StripePaymentResult> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  let customer: Stripe.Customer;
  const stripeCustomers = await stripe.customers.list({
    email: context.user.email!,
  });
  if (!stripeCustomers.data.length) {
    console.log('creating customer');
    customer = await stripe.customers.create({
      email: context.user.email!,
    });
  } else {
    console.log('using existing customer');
    customer = stripeCustomers.data[0];
  }

  const session: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: process.env.SUBSCRIPTION_PRICE_ID!,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${DOMAIN}/checkout?success=true`,
    cancel_url: `${DOMAIN}/checkout?canceled=true`,
    automatic_tax: { enabled: true },
    customer_update: {
      address: 'auto',
    },
    customer: customer.id,
  });

  await context.entities.User.update({
    where: {
      id: context.user.id,
    },
    data: {
      checkoutSessionId: session?.id ?? null,
      stripeId: customer.id ?? null,
    },
  });

  if (!session) {
    throw new HttpError(402, 'Could not create a Stripe session');
  } else {
    return {
      sessionUrl: session.url,
      sessionId: session.id,
    };
  }
};

type GptPayload = {
  instructions: string;
  command: string;
  temperature: number;
};

export const generateGptResponse: GenerateGptResponse<GptPayload, RelatedObject> = async (
  { instructions, command, temperature },
  context
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const payload = {
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: instructions,
      },
      {
        role: 'user',
        content: command,
      },
    ],
    temperature: Number(temperature),
  };

  try {
    if (!context.user.hasPaid && !context.user.credits) {
      throw new HttpError(402, 'User has not paid or is out of credits');
    } else if (context.user.credits && !context.user.hasPaid) {
      console.log('decrementing credits');
      await context.entities.User.update({
        where: { id: context.user.id },
        data: {
          credits: {
            decrement: 1,
          },
        },
      });
    }

    console.log('fetching', payload);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      },
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const json = (await response.json()) as OpenAIResponse;
    console.log('response json', json);
    return context.entities.RelatedObject.create({
      data: {
        content: json?.choices[0].message.content,
        user: { connect: { id: context.user.id } },
      },
    });
  } catch (error: any) {
    if (!context.user.hasPaid && error?.statusCode != 402) {
      await context.entities.User.update({
        where: { id: context.user.id },
        data: {
          credits: {
            increment: 1,
          },
        },
      });
    }
    console.error(error);
  }

  throw new HttpError(500, 'Something went wrong');
};
