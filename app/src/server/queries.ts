import HttpError from '@wasp/core/HttpError.js';
import type { DailyStats, GptResponse, User, PageViewSource, Task } from '@wasp/entities';
import type {
  GetGptResponses,
  GetDailyStats,
  GetPaginatedUsers,
  GetAllTasksByUser
} from '@wasp/queries/types';

type DailyStatsWithSources = DailyStats & {
  sources: PageViewSource[];
};

type DailyStatsValues = {
  dailyStats: DailyStatsWithSources;
  weeklyStats: DailyStatsWithSources[];
};

export const getGptResponses: GetGptResponses<void, GptResponse[]> = async (args, context) => {
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
}

export const getDailyStats: GetDailyStats<void, DailyStatsValues> = async (_args, context) => {
  if (!context.user?.isAdmin) {
    throw new HttpError(401);
  }
  const dailyStats = await context.entities.DailyStats.findFirstOrThrow({
    orderBy: {
      date: 'desc',
    },
    include: {
      sources: true,
    },
  });

  const weeklyStats = await context.entities.DailyStats.findMany({
    orderBy: {
      date: 'desc',
    },
    take: 7,
    include: {
      sources: true,
    },
  });

  return { dailyStats, weeklyStats };
};

type GetPaginatedUsersInput = {
  skip: number;
  cursor?: number | undefined;
  hasPaidFilter: boolean | undefined;
  emailContains?: string;
  subscriptionStatus?: string[];
};
type GetPaginatedUsersOutput = {
  users: Pick<User, 'id' | 'email' | 'username' | 'lastActiveTimestamp' | 'hasPaid' | 'subscriptionStatus' | 'stripeId'>[];
  totalPages: number;
};

export const getPaginatedUsers: GetPaginatedUsers<GetPaginatedUsersInput, GetPaginatedUsersOutput> = async (
  args,
  context
) => {
  let subscriptionStatus = args.subscriptionStatus?.filter((status) => status !== 'hasPaid');
  subscriptionStatus = subscriptionStatus?.length ? subscriptionStatus : undefined;

  const queryResults = await context.entities.User.findMany({
    skip: args.skip,
    take: 10,
    where: {
      email: {
        contains: args.emailContains || undefined,
        mode: 'insensitive',
      },
      hasPaid: args.hasPaidFilter,
      subscriptionStatus: {
        in: subscriptionStatus || undefined,
      },
    },
    select: {
      id: true,
      email: true,
      username: true,
      lastActiveTimestamp: true,
      hasPaid: true,
      subscriptionStatus: true,
      stripeId: true,
    },
    orderBy: {
      id: 'desc',
    },
  });

  const totalUserCount = await context.entities.User.count({
    where: {
      email: {
        contains: args.emailContains || undefined,
      },
      hasPaid: args.hasPaidFilter,
      subscriptionStatus: {
        in: subscriptionStatus || undefined,
      },
    },
  });
  const totalPages = Math.ceil(totalUserCount / 10);

  return {
    users: queryResults,
    totalPages,
  };
};