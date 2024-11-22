import { type DailyStats, type PageViewSource } from 'wasp/entities';
import { HttpError } from 'wasp/server';
import { type GetDailyStats } from 'wasp/server/operations';

type DailyStatsWithSources = DailyStats & {
  sources: PageViewSource[];
};

type DailyStatsValues = {
  dailyStats: DailyStatsWithSources;
  weeklyStats: DailyStatsWithSources[];
};

export const getDailyStats: GetDailyStats<void, DailyStatsValues> = async (_args, context) => {
  if (!context.user?.isAdmin) {
    throw new HttpError(401);
  }
  const dailyStats = await context.entities.DailyStats.findFirst({
    orderBy: {
      date: 'desc',
    },
    include: {
      sources: true,
    },
  });
  if (!dailyStats) {
    throw new HttpError(204, 'No daily stats generated yet.');
  }

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
