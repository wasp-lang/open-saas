import { type DailyAnalytics, type PageViewSource } from 'wasp/entities';
import { HttpError } from 'wasp/server';
import { type GetAnalyticsDataByDay } from 'wasp/server/operations';

type DailyAnalyticsWithSources = DailyAnalytics & {
  pageViewSources: PageViewSource[];
};

type AnalyticsData = {
  todaysAnalyticsData: DailyAnalyticsWithSources;
  dailyAnalyticsFromPastWeek: DailyAnalyticsWithSources[];
};

export const getAnalyticsDataByDay: GetAnalyticsDataByDay<void, AnalyticsData | undefined> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Only authenticated users are allowed to perform this operation');
  }

  if (!context.user.isAdmin) {
    throw new HttpError(403, 'Only admins are allowed to perform this operation');
  }

  const statsQuery = {
    orderBy: {
      date: 'desc',
    },
    include: {
      pageViewSources: true,
    },
  } as const;

  const dailyAnalyticsFromPastWeek = await context.entities.DailyAnalytics.findMany({ ...statsQuery, take: 7 });
  const todaysAnalyticsData = dailyAnalyticsFromPastWeek[0];

  if (!todaysAnalyticsData) {
    return handleNoDailyAnalyticsFound();
  }

  return { todaysAnalyticsData, dailyAnalyticsFromPastWeek };
};

function handleNoDailyAnalyticsFound() {
  const LOG_COLOR_BLUE = '\x1b[34m';
  const LOG_COLOR_RESET = '\x1b[0m';
  console.log(`${LOG_COLOR_BLUE}Note: No daily analytics found. ${LOG_COLOR_RESET}`);
  return undefined;
}