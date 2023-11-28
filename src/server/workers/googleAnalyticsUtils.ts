import { BetaAnalyticsDataClient } from '@google-analytics/data';

const clientEmail = process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL;
// const privateKey =
// '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC0pLaSKNIJ4Lio\nTunlGK0T5a228onb8zrpF/i4TMlkHoRwtJFIj19Hvj6RiGRkNCP62x1AfFwiUVzd\nV8BuagsN+BwaxvW/gZS7JeDdB7W5G5w9wTmY75gWpVy034lUoTK1Oe+mpA1m9UG7\nXv/0iUcz88vubZWXDOlnYYm2EIVboONuKwJglaVzgvlNMkpZQHzomOwmCIs/6Ujr\ntOWL3ESUKgLSmLwv/NRwAYCa3DMQ3uYwKQT73ZlHgX8R4cqmvP2AwQIeBlM4pq4S\nhUsDPpFhHEbTBww4uLXaUETW8j26tAZKYq17NjoUnMx0eRW2kkEuOz9l8D/4297D\n9ARjpWRJAgMBAAECggEAAhE4fae176MAufxdNN/5axbfzA4ugbPg4rYBhKpsS5cF\n0PxgBUKOxpVoxeWXsIXgO4iyZwCFVWc09tuAOkNAaSKDv9KzEUP8Xb/rONxTuhCU\n0ygY7qUfSnMOAovkWHGX0PcexPtvo9P+spQ9vaCsje2mUc4zPg1JxoMZPlomDIxf\n38wPtTThJCwHc7uOg0BAof3vjF+zC6Vf1YYLiqlNhAC9E6aS8Np8CVXtpxRsJifn\nb5E6jBESK9PjrtPFdUtRcm7j2vohmLqCy+6ddwjwlCSxcpIky1QVlXNxmH/qkvKA\nK8vrLJlXeGuOb3ISsRrHSfY5J8fnFtol0Rec5Bag4QKBgQDjzl0xO6PnfuGRWs/d\nVfrZuuRmQvFx7kj9D04sC4NVwWuYFauh7RWt8nJwgbRdR3lHqTQ7JlUe4627y1PW\nOzffrbMY0Q3DiwLXj+mYbt2cfrHGqPxGYjeKJCMIvbHOzQ7NBacjtw/AflxsDqKx\n2Wzu//j0QISv2uH/zNESlsd2HQKBgQDLABT7uDMoxn4JIzEwqZTdzfASaSZQ1ppU\nbdm7Tug7hNVCU+orhgAa8k6ODCjH75uwdPrkstjzmQ303Zwxfw1llt1X8CICEqNR\nPS1Ptl+5H2wBcH8K96fFeGLO5CuWOmt/e1C19n3VJULQsh9jdj5yA2rfSI7DvfsC\nCnIjvKWfHQKBgQDR2WDJoIn9D0mVD5WZ68E33szVUud9rya3TukQ884ZKiMGJzhC\n4tZstYEsGJ9gqh2ToM/HiSkyWkPJUaU6HLT8rNLlknZeYmjMz/o8fCxTI/Z57WLv\nJzzIWT+Ypr3rpcPzozhzUwgEp6JVvCmtMYACrfPUdLaGFFjJvg/+Ur0NFQKBgGQ0\nMCdo72frQv+DrZ5VtzQdmamc2dsBc8DFULrS4nOuyA4rmeXOCXNDtF8NxXub3QAn\nXklRtyHXpTn/wj/0dUp2Q+BKmp7nUFKjniBA59NbnVbAjxV81gX1vOBfZNyNDc8p\nsdeASvDRqb+WjUPtdDmXUkPRbxdUSfjh6yGU1zRJAoGBALfUrbxg8t827HMa+xLH\nMvaBHqdQ6jhdjm51sOUfRBe2EOKQWug/Dnr+XlQKWN467JCWmKS0HfQY16BLIusQ\nUUc2dD+7jFTgtkvnSHvrbj+WX1Zl4tvkawxozu04Me83Fx2eYbxf0Ds5D4HiB04j\nn6O2YEStTVYy4ViSPGxTYKEI\n-----END PRIVATE KEY-----\n';
const privateKey = Buffer.from(process.env.GOOGLE_ANALYTICS_PRIVATE_KEY!, 'base64').toString('utf-8');

const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  },
});

export async function getSources() {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [
      {
        startDate: 'yesterday',
        endDate: 'today',
      },
    ],
    // for a list of dimensions and metrics see https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema
    // get total page views
    dimensions: [
      {
        name: 'pageReferrer',
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
    property: `properties/${propertyId}`,
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
    property: `properties/${propertyId}`,

    dateRanges: [
      {
        startDate: '2daysAgo',
        endDate: 'yesterday',
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
        console.log('Page views are zero, so no percentage change');
        return '0';
      }

      const change = ((viewsFromYesterday - viewsFromDayBeforeYesterday) / viewsFromDayBeforeYesterday) * 100;
      return change.toFixed(2);
    }
  } else {
    return '0';
  }
}
