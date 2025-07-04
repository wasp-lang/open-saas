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

export async function getSources() {
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

  let activeUsersPerReferrer: any[] = [];
  if (response?.rows) {
    activeUsersPerReferrer = response.rows.map((row) => {
      if (row.dimensionValues && row.metricValues) {
        return {
          source: row.dimensionValues[0].value,
          visitors: row.metricValues[0].value,
        };
      }
    });
  } else {
    throw new Error('No response from Google Analytics');
  }

  return activeUsersPerReferrer;
}

export async function getDailyPageViews() {
  const totalViews = await getTotalPageViews();
  const prevDayViewsChangePercent = await getPrevDayViewsChangePercent();

  return {
    totalViews,
    prevDayViewsChangePercent,
  };
}

async function getTotalPageViews() {
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
  if (response?.rows) {
    // @ts-ignore
    totalViews = parseInt(response.rows[0].metricValues[0].value);
  } else {
    throw new Error('No response from Google Analytics');
  }
  return totalViews;
}

async function getPrevDayViewsChangePercent() {
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

  let viewsFromYesterday;
  let viewsFromDayBeforeYesterday;

  if (response?.rows && response.rows.length === 2) {
    // @ts-ignore
    viewsFromYesterday = response.rows[0].metricValues[0].value;
    // @ts-ignore
    viewsFromDayBeforeYesterday = response.rows[1].metricValues[0].value;

    if (viewsFromYesterday && viewsFromDayBeforeYesterday) {
      viewsFromYesterday = parseInt(viewsFromYesterday);
      viewsFromDayBeforeYesterday = parseInt(viewsFromDayBeforeYesterday);
      if (viewsFromYesterday === 0 || viewsFromDayBeforeYesterday === 0) {
        return '0';
      }
      console.table({ viewsFromYesterday, viewsFromDayBeforeYesterday });

      const change = ((viewsFromYesterday - viewsFromDayBeforeYesterday) / viewsFromDayBeforeYesterday) * 100;
      return change.toFixed(0);
    }
  } else {
    return '0';
  }
}
