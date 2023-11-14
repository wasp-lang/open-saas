import HttpError from '@wasp/core/HttpError.js';
import type { DailyStats, RelatedObject } from '@wasp/entities';
import type { GetRelatedObjects, GetDailyStats } from '@wasp/queries/types';

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

  return {dailyStats, weeklyStats};
}