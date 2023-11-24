import HttpError from '@wasp/core/HttpError.js';
import { getTotalPageViews, calculateDailyChangePercentage } from './analyticsUtils.js';
import type { DailyStats, RelatedObject, Referrer, User } from '@wasp/entities';
import type {
  GetRelatedObjects,
  GetDailyStats,
  GetReferrerStats,
  GetPaginatedUsers,
  GetPlausibleStats,
} from '@wasp/queries/types';

type DailyStatsValues = {
  dailyStats: DailyStats;
  weeklyStats: DailyStats[];
};

export const getRelatedObjects: GetRelatedObjects<void, RelatedObject[]> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return context.entities.RelatedObject.findMany({
    where: {
      user: {
        id: context.user.id,
      },
    },
  });
};

export const getDailyStats: GetDailyStats<void, DailyStatsValues> = async (_args, context) => {
  if (!context.user?.isAdmin) {
    throw new HttpError(401);
  }
  const dailyStats = await context.entities.DailyStats.findFirstOrThrow({
    orderBy: {
      date: 'desc',
    },
  });

  const weeklyStats = await context.entities.DailyStats.findMany({
    orderBy: {
      date: 'desc',
    },
    take: 7,
  });

  return { dailyStats, weeklyStats };
};

type ReferrerWithSanitizedUsers = Referrer & {
  users: Pick<User, 'id' | 'email' | 'hasPaid' | 'subscriptionStatus'>[];
};

export const getReferrerStats: GetReferrerStats<void, ReferrerWithSanitizedUsers[]> = async (args, context) => {
  const referrers = await context.entities.Referrer.findMany({
    include: {
      users: true,
    },
  });

  return referrers.map((referrer) => ({
    ...referrer,
    users: referrer.users.map((user) => ({
      id: user.id,
      email: user.email,
      hasPaid: user.hasPaid,
      subscriptionStatus: user.subscriptionStatus,
    })),
  }));
};

type GetPaginatedUsersInput = {
  skip: number;
  cursor?: number | undefined;
  hasPaidFilter: boolean | undefined;
  emailContains?: string;
  subscriptionStatus?: string[];
};
type GetPaginatedUsersOutput = {
  users: Pick<User, 'id' | 'email' | 'lastActiveTimestamp' | 'hasPaid' | 'subscriptionStatus' | 'stripeId'>[];
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

// TODO: move this and analyticsUtils to Cron Job
export const getPlausibleStats: GetPlausibleStats<
  void,
  { totalPageViews: string | undefined; dailyChangePercentage: string | undefined }
> = async (_args, context) => {
  if (!context.user?.isAdmin) {
    throw new HttpError(401);
  }

  const totalPageViews = (await getTotalPageViews()).toString();
  const dailyChangePercentage = await calculateDailyChangePercentage();

  return {
    totalPageViews,
    dailyChangePercentage,
  };
};
