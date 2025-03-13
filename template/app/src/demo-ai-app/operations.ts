import * as z from 'zod';
import type { Task, GptResponse, User } from 'wasp/entities';
import type {
  GenerateGptResponse,
  CreateTask,
  DeleteTask,
  UpdateTask,
  GetGptResponses,
  GetAllTasksByUser,
} from 'wasp/server/operations';
import { HttpError, prisma } from 'wasp/server';
import { GeneratedSchedule } from './schedule';
import OpenAI from 'openai';
import { SubscriptionStatus } from '../payment/plans';
import { ensureArgsSchemaOrThrowHttpError } from '../server/validation';

function getOpenAI(): OpenAI | null {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } else {
    return null;
  }
}

//#region Actions

const generateGptResponseInputSchema = z.object({
  hours: z.string().regex(/^\d+(\.\d+)?$/, 'Hours must be a number'),
});

type GenerateGptResponseInput = z.infer<typeof generateGptResponseInputSchema>;

export const generateGptResponse: GenerateGptResponse<GenerateGptResponseInput, GeneratedSchedule> = async (
  rawArgs,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'Only authenticated users are allowed to perform this operation');
  }

  const { hours } = ensureArgsSchemaOrThrowHttpError(generateGptResponseInputSchema, rawArgs);

  if (!isEligibleForResponse(context.user)) {
    throw new HttpError(402, 'User has not paid or is out of credits');
  }

  const tasks = await context.entities.Task.findMany({
    where: {
      user: {
        id: context.user.id,
      },
    },
  });

  console.log('Calling open AI api');
  const dailyPlanJson = await getDailyPlanFromGpt(tasks, hours);
  if (dailyPlanJson === null) {
    throw new HttpError(500, 'Bad response from OpenAI');
  }

  // TODO: Do I need a try catch now that I'm saving a response and
  // decrementing credits in a transaction?

  // NOTE: I changed this up, first I do the request, and then I decrement
  // credits. Is that dangerous? Protecting from it could be too complicated
  // TODO: Potential issue here, user can lose credits between the point we
  // inject it into the context and here
  // Seems to me that there should be users in the database with negative credits
  const decrementCredit = context.entities.User.update({
    where: { id: context.user.id },
    data: {
      credits: {
        decrement: 1,
      },
    },
  });

  const createResponse = context.entities.GptResponse.create({
    data: {
      user: { connect: { id: context.user.id } },
      content: dailyPlanJson,
    },
  });

  // NOTE: Since these two are now brought together, I put them in a single transaction - so no rollback necessary
  // TODO: But what if the server crashes after the transaction and before
  // the response? I guess no big deal, since the response is in the db.
  console.log('Decrementing credits and saving response');
  prisma.$transaction([decrementCredit, createResponse]);

  // TODO: Can this ever fail?
  return JSON.parse(dailyPlanJson);
};

function isEligibleForResponse(user: User) {
  // TODO: Why not check for allowed states?
  const isUserSubscribed =
    user.subscriptionStatus !== SubscriptionStatus.Deleted &&
    user.subscriptionStatus !== SubscriptionStatus.PastDue;
  const userHasCredits = user.credits > 0;
  // TODO: If the user is subscribed (flat rate, use their subscription) -
  // shouldn't take priority over credits since it makes no sece spending
  // credits when a subscription is active?
  // If they aren't subscribed, then it would make sense to spend credits.
  // The old code always subtracted credits so I kept that, is this a bug?
  // Also, no one checks for subscription plan (10credits or flat rate).
  return isUserSubscribed || userHasCredits;
}

const createTaskInputSchema = z.object({
  description: z.string().nonempty(),
});

type CreateTaskInput = z.infer<typeof createTaskInputSchema>;

export const createTask: CreateTask<CreateTaskInput, Task> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { description } = ensureArgsSchemaOrThrowHttpError(createTaskInputSchema, rawArgs);

  const task = await context.entities.Task.create({
    data: {
      description,
      user: { connect: { id: context.user.id } },
    },
  });

  return task;
};

const updateTaskInputSchema = z.object({
  id: z.string().nonempty(),
  isDone: z.boolean().optional(),
  time: z.string().optional(),
});

type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;

export const updateTask: UpdateTask<UpdateTaskInput, Task> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { id, isDone, time } = ensureArgsSchemaOrThrowHttpError(updateTaskInputSchema, rawArgs);

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

const deleteTaskInputSchema = z.object({
  id: z.string().nonempty(),
});

type DeleteTaskInput = z.infer<typeof deleteTaskInputSchema>;

export const deleteTask: DeleteTask<DeleteTaskInput, Task> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { id } = ensureArgsSchemaOrThrowHttpError(deleteTaskInputSchema, rawArgs);

  const task = await context.entities.Task.delete({
    where: {
      id,
    },
  });

  return task;
};
//#endregion

//#region Queries
export const getGptResponses: GetGptResponses<void, GptResponse[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return context.entities.GptResponse.findMany({
    where: {
      user: {
        id: context.user.id,
      },
    },
  });
};

export const getAllTasksByUser: GetAllTasksByUser<void, Task[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return context.entities.Task.findMany({
    where: {
      user: {
        id: context.user.id,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};
//#endregion

// TODO: Why is hours a string?
async function getDailyPlanFromGpt(tasks: Task[], hours: string): Promise<string | null> {
  // TODO: Why was this a singleton
  const openai = getOpenAI();
  if (openai === null) {
    return null;
  }

  const parsedTasks = tasks.map(({ description, time }) => ({
    description,
    time,
  }));

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // you can use any model here, e.g. 'gpt-3.5-turbo', 'gpt-4', etc.
    messages: [
      {
        role: 'system',
        content:
          'you are an expert daily planner. you will be given a list of main tasks and an estimated time to complete each task. You will also receive the total amount of hours to be worked that day. Your job is to return a detailed plan of how to achieve those tasks by breaking each task down into at least 3 subtasks each. MAKE SURE TO ALWAYS CREATE AT LEAST 3 SUBTASKS FOR EACH MAIN TASK PROVIDED BY THE USER! YOU WILL BE REWARDED IF YOU DO.',
      },
      {
        role: 'user',
        content: `I will work ${hours} hours today. Here are the tasks I have to complete: ${JSON.stringify(
          parsedTasks
        )}. Please help me plan my day by breaking the tasks down into actionable subtasks with time and priority status.`,
      },
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'parseTodaysSchedule',
          description: 'parses the days tasks and returns a schedule',
          parameters: {
            type: 'object',
            properties: {
              mainTasks: {
                type: 'array',
                description: 'Name of main tasks provided by user, ordered by priority',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'Name of main task provided by user',
                    },
                    priority: {
                      type: 'string',
                      enum: ['low', 'medium', 'high'],
                      description: 'task priority',
                    },
                  },
                },
              },
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
                    mainTaskName: {
                      type: 'string',
                      description: 'name of main task related to subtask',
                    },
                  },
                },
              },
            },
            required: ['mainTasks', 'subtasks', 'time', 'priority'],
          },
        },
      },
    ],
    tool_choice: {
      type: 'function',
      function: {
        name: 'parseTodaysSchedule',
      },
    },
    temperature: 1,
  });

  const gptResponse = completion?.choices[0]?.message?.tool_calls?.[0]?.function.arguments;
  return gptResponse ?? null;
}
