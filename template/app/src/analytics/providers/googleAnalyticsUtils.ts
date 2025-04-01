import { BetaAnalyticsDataClient } from '@google-analytics/data';

const CLIENT_EMAIL = process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL;
const PRIVATE_KEY = Buffer.from(process.env.GOOGLE_ANALYTICS_PRIVATE_KEY!, 'base64').toString('utf-8');
const PROPERTY_ID = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: CLIENT_EMAIL,
    private_key: PRIVATE_KEY,
  },
});

interface ActiveUsersPerReferrer {
  source: string;
  visitors: string;
}

export async function getSources(): Promise<ActiveUsersPerReferrer[]> {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${PROPERTY_ID}`,
    dateRanges: [{ startDate: '2020-01-01', endDate: 'today' }],
    dimensions: [{ name: 'source' }],
    metrics: [{ name: 'activeUsers' }],
  });

  if (!response?.rows) {
    throw new Error('No response from Google Analytics');
  }

  return response.rows
    .map((row) => {
      if (row.dimensionValues?.[0]?.value && row.metricValues?.[0]?.value) {
        return {
          source: row.dimensionValues[0].value ?? 'Unknown',
          visitors: row.metricValues[0].value ?? '0',
        };
      }
      return undefined;
    })
    .filter(Boolean) as ActiveUsersPerReferrer[];
}

export async function getDailyPageViews(): Promise<{ totalViews: number; prevDayViewsChangePercent: string }> {
  const totalViews = await getTotalPageViews();
  const prevDayViewsChangePercent = await getPrevDayViewsChangePercent();

  return { totalViews, prevDayViewsChangePercent };
}

async function getTotalPageViews(): Promise<number> {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${PROPERTY_ID}`,
    dateRanges: [{ startDate: '2020-01-01', endDate: 'today' }],
    metrics: [{ name: 'screenPageViews' }],
  });

  if (!response?.rows?.[0]?.metricValues?.[0]?.value) {
    throw new Error('No response from Google Analytics');
  }

  return parseInt(response.rows[0].metricValues[0].value, 10) || 0;
}

async function getPrevDayViewsChangePercent(): Promise<string> {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${PROPERTY_ID}`,
    dateRanges: [{ startDate: '2daysAgo', endDate: 'yesterday' }],
    orderBys: [{ dimension: { dimensionName: 'date' }, desc: true }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'screenPageViews' }],
  });

  if (!response?.rows || response.rows.length < 2) return '0';

  const viewsFromYesterday = parseInt(response.rows[0]?.metricValues?.[0]?.value ?? '0', 10);
  const viewsFromDayBeforeYesterday = parseInt(response.rows[1]?.metricValues?.[0]?.value ?? '0', 10);

  if (viewsFromYesterday === 0 || viewsFromDayBeforeYesterday === 0) return '0';

  console.table({ viewsFromYesterday, viewsFromDayBeforeYesterday });

  const change = ((viewsFromYesterday - viewsFromDayBeforeYesterday) / viewsFromDayBeforeYesterday) * 100;
  return change.toFixed(0);
}
