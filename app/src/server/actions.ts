import Stripe from 'stripe';
import fetch from 'node-fetch';
import HttpError from '@wasp/core/HttpError.js';
import type { GptResponse, User } from '@wasp/entities';
import type { GenerateGptResponse, StripePayment } from '@wasp/actions/types';
import type { StripePaymentResult, OpenAIResponse } from './types';
import { UpdateCurrentUser, UpdateUserById } from '@wasp/actions/types';
import { fetchStripeCustomer, createStripeCheckoutSession } from './stripeUtils.js';
import { TierIds } from '@wasp/shared/constants.js';

export const stripePayment: StripePayment<string, StripePaymentResult> = async (tier, context) => {
  if (!context.user || !context.user.email) {
    throw new HttpError(401);
  }

  let priceId;
  if (tier === TierIds.HOBBY) {
    priceId = process.env.HOBBY_SUBSCRIPTION_PRICE_ID!;
  } else if (tier === TierIds.PRO) {
    priceId = process.env.PRO_SUBSCRIPTION_PRICE_ID!;
  } else {
    throw new HttpError(400, 'Invalid tier');
  }

  let customer: Stripe.Customer;
  let session: Stripe.Checkout.Session;
  try {
    customer = await fetchStripeCustomer(context.user.email);
    session = await createStripeCheckoutSession({
      priceId,
      customerId: customer.id,
    });
  } catch (error: any) {
    throw new HttpError(500, error.message);
  }

  await context.entities.User.update({
    where: {
      id: context.user.id,
    },
    data: {
      checkoutSessionId: session.id,
      stripeId: customer.id,
    },
  });

  return {
    sessionUrl: session.url,
    sessionId: session.id,
  };
};

type GptPayload = {
  instructions: string;
  command: string;
  temperature: number;
};

export const generateGptResponse: GenerateGptResponse<GptPayload, GptResponse> = async (
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
    return context.entities.GptResponse.create({
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
    throw new HttpError(500, error.message);
  }
};

export const updateUserById: UpdateUserById<{ id: number; data: Partial<User> }, User> = async (
  { id, data },
  context
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  if (!context.user.isAdmin) {
    throw new HttpError(403);
  }

  const updatedUser = await context.entities.User.update({
    where: {
      id,
    },
    data,
  });

  console.log('updated user', updatedUser.id);

  return updatedUser;
};

export const updateCurrentUser: UpdateCurrentUser<Partial<User>, User> = async (user, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  console.log('updating user', user);

  return context.entities.User.update({
    where: {
      id: context.user.id,
    },
    data: user,
  });
};
