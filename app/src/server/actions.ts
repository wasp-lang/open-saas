import Stripe from 'stripe';
import fetch from 'node-fetch';
import HttpError from '@wasp/core/HttpError.js';
import type { User, Task } from '@wasp/entities';
import type { GenerateGptResponse, StripePayment } from '@wasp/actions/types';
import type { StripePaymentResult } from './types';
import { UpdateCurrentUser, UpdateUserById, CreateTask, DeleteTask, UpdateTask } from '@wasp/actions/types';
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
  hours: string;
};

export const generateGptResponse: GenerateGptResponse<GptPayload, string> = async ({ hours }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const tasks = await context.entities.Task.findMany({
    where: {
      user: {
        id: context.user.id,
      },
    },
  });

  // use map to extract the description and time from each task
  const parsedTasks = tasks.map(({ description, time }) => ({ description, time }));

  const payload = {
    model: 'gpt-3.5-turbo', // e.g. 'gpt-3.5-turbo', 'gpt-4', 'gpt-4-0613', gpt-4-1106-preview
    messages: [
      {
        role: 'system',
        content:
          'you are an expert daily planner and scheduling assistant. you will be given a list of main tasks and an estimated time to complete each task. You will also receive the total amount of hours to be worked that day. Your job is to return a detailed plan of how to achieve those tasks throughout the day by breaking down the main tasks provided by the user into multiple subtasks. Be specific in your reply and offer advice on the best way to fulfill each task. Please also schedule in standing, water, lunch, and coffee breaks. Plan the higher priority tasks first. Also give the total amount of time to be spent on each (sub)task after considering all of the above. ',
      },
      {
        role: 'user',
        content: `I will work ${hours} today. Here are the tasks I have to complete: ` + JSON.stringify(parsedTasks),
      },
    ],
    functions: [
      {
        name: 'parseTodaysSchedule',
        description: 'parses the days tasks and returns a schedule',
        parameters: {
          type: 'object',
          properties: {
            schedule: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Name of main task provided by user' },
                  subtasks: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        description: {
                          type: 'string',
                          description:
                            'detailed breakdown and description of sub-task related to main task. e.g., "Prepare your learning session by first reading through the documentation"',
                        },
                        time: {
                          type: 'number',
                          description: 'time allocated for a given subtask in hours, e.g. 0.5',
                        },
                      },
                    },
                  },
                  breaks: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        description: {
                          type: 'string',
                          description:
                            'detailed breakdown and description of break. e.g., "take a 15 minute standing break and reflect on what you have learned".',
                        },
                        time: { type: 'number', description: 'time allocated for a given break in hours, e.g. 0.2' },
                      },
                    },
                  },
                  time: {
                    type: 'number',
                    description: 'total time in it takes to complete given main task in hours, e.g. 2.75',
                  },
                  priority: {
                    type: 'string',
                    enum: ['low', 'medium', 'high'],
                    description: 'task priority',
                  },
                },
              },
            },
          },
          required: ['schedule'],
        },
      },
    ],
    function_call: {
      name: 'parseTodaysSchedule',
    },
    temperature: 1,
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      },
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new HttpError(500, 'Bad response from OpenAI');
    }

    let json = (await response.json()) as any;

    const gptArgs = json.choices[0].message.function_call.arguments;

    await context.entities.GptResponse.create({
      data: {
        user: { connect: { id: context.user.id } },
        content: JSON.stringify(gptArgs),
      },
    });

    return gptArgs;

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
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || 'Internal server error';
    throw new HttpError(statusCode, errorMessage);
  }
};

export const createTask: CreateTask<Pick<Task, 'description'>, Task> = async ({ description }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const task = await context.entities.Task.create({
    data: {
      description,
      user: { connect: { id: context.user.id } },
    },
  });

  return task;
};

export const updateTask: UpdateTask<Partial<Task>, Task> = async ({ id, isDone, time }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const task = await context.entities.Task.update({
    where: {
      id,
    },
    data: {
      isDone,
      time,
    },
  });

  return task;
};

export const deleteTask: DeleteTask<Pick<Task, 'id'>, Task> = async ({ id }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const task = await context.entities.Task.delete({
    where: {
      id,
    },
  });

  return task;
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

  return updatedUser;
};

export const updateCurrentUser: UpdateCurrentUser<Partial<User>, User> = async (user, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  return context.entities.User.update({
    where: {
      id: context.user.id,
    },
    data: user,
  });
};
