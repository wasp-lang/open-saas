import type { Task, GptResponse } from 'wasp/entities';
import type { GenerateGptResponse, CreateTask, DeleteTask, UpdateTask, GetGptResponses, GetAllTasksByUser } from 'wasp/server/operations';
import { HttpError } from 'wasp/server';
import { GeneratedSchedule } from './schedule';
import OpenAI from 'openai';

const openai = setupOpenAI();
function setupOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    return new HttpError(500, 'OpenAI API key is not set');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

//#region Actions
type GptPayload = {
  hours: string;
};

export const generateGptResponse: GenerateGptResponse<GptPayload, GeneratedSchedule> = async ({ hours }, context) => {
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

  const parsedTasks = tasks.map(({ description, time }) => ({
    description,
    time,
  }));

  try {
    // check if openai is initialized correctly with the API key
    if (openai instanceof Error) {
      throw openai;
    }

    if (
      !context.user.credits &&
      (!context.user.subscriptionStatus ||
        context.user.subscriptionStatus === 'deleted' ||
        context.user.subscriptionStatus === 'past_due')
    ) {
      throw new HttpError(402, 'User has not paid or is out of credits');
    } else if (context.user.credits && !context.user.subscriptionStatus) {
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

    const gptArgs = completion?.choices[0]?.message?.tool_calls?.[0]?.function.arguments;

    if (!gptArgs) {
      throw new HttpError(500, 'Bad response from OpenAI');
    }

    console.log('gpt function call arguments: ', gptArgs);

    await context.entities.GptResponse.create({
      data: {
        user: { connect: { id: context.user.id } },
        content: JSON.stringify(gptArgs),
      },
    });

    return JSON.parse(gptArgs);
  } catch (error: any) {
    if (!context.user.subscriptionStatus && error?.statusCode != 402) {
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