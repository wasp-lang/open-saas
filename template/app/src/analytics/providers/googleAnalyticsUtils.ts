import { BetaAnalyticsDataClient, protos } from '@google-analytics/data';

const CLIENT_EMAIL = process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL;
const PRIVATE_KEY = Buffer.from(process.env.GOOGLE_ANALYTICS_PRIVATE_KEY!, 'base64').toString('utf-8');
const PROPERTY_ID = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

const analyticsDataClient: BetaAnalyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: CLIENT_EMAIL!,
    private_key: PRIVATE_KEY,
  },
});

type GAResponseRow = protos.google.analytics.data.v1beta.IRow;
type ActiveUsersPerReferrer = {
  source: string | undefined;
  visitors: string | undefined;
};

export async function getSources(): Promise<ActiveUsersPerReferrer[]> {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${PROPERTY_ID}`,
    dateRanges: [
      {
        startDate: '2020-01-01',
        endDate: 'today',
      },
    ],
    // for a list of dimensions and metrics see https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema
    dimensions: [
      {
        name: 'source',
      },
    ],
    metrics: [
      {
        name: 'activeUsers',
      },
    ],
  });

  let activeUsersPerReferrer: ActiveUsersPerReferrer[] = [];
  if (response?.rows) {
    activeUsersPerReferrer = response.rows.map((row: GAResponseRow) => {
      if (row.dimensionValues && row.metricValues) {
        return {
          source: row.dimensionValues[0].value,
          visitors: row.metricValues[0].value,
        };
      }
    }).filter(Boolean) as ActiveUsersPerReferrer[];
    
  } else {
    throw new Error('No response from Google Analytics');
  }

  return activeUsersPerReferrer;
}

export async function getDailyPageViews(): Promise<{ totalViews: number; prevDayViewsChangePercent: string }> {
  const totalViews: number = await getTotalPageViews();
  const prevDayViewsChangePercent: string = await getPrevDayViewsChangePercent();

  return {
    totalViews,
    prevDayViewsChangePercent,
  };
}

async function getTotalPageViews(): Promise<number> {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${PROPERTY_ID}`,
    dateRanges: [
      {
        startDate: '2020-01-01', // go back to earliest date of your app
        endDate: 'today',
      },
    ],
    metrics: [
      {
        name: 'screenPageViews',
      },
    ],
  });

  let totalViews = 0;
  if (response.rows) {

    const value = response.rows?.[0]?.metricValues?.[0]?.value;
    totalViews = value ? parseInt(value) : 0;
    
  } else {
    throw new Error('No response from Google Analytics');
  }
  return totalViews;
}

async function getPrevDayViewsChangePercent(): Promise<string> {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${PROPERTY_ID}`,

    dateRanges: [
      {
        startDate: '2daysAgo',
        endDate: 'yesterday',
      },
    ],
    orderBys: [
      {
        dimension: {
          dimensionName: 'date',
        },
        desc: true,
      },
    ],
    dimensions: [
      {
        name: 'date',
      },
    ],
    metrics: [
      {
        name: 'screenPageViews',
      },
    ],
  });

  let viewsFromYesterday: number | undefined;
  let viewsFromDayBeforeYesterday: number | undefined;

  if (response?.rows && response.rows.length === 2) {
    // @ts-ignore
    viewsFromYesterday = parseInt(response.rows[0].metricValues[0].value);
    // @ts-ignore
    viewsFromDayBeforeYesterday = parseInt(response.rows[1].metricValues[0].value);

    if (viewsFromYesterday === 0 || viewsFromDayBeforeYesterday === 0) {
      return '0';
    }
    console.table({ viewsFromYesterday, viewsFromDayBeforeYesterday });

    const change = ((viewsFromYesterday - viewsFromDayBeforeYesterday) / viewsFromDayBeforeYesterday) * 100;
    return change.toFixed(0);
  } else {
    return '0';
  }
}
