const PLAUSIBLE_API_KEY = process.env.PLAUSIBLE_API_KEY!; // Replace with your Plausible API key
const PLAUSIBLE_SITE_ID = 'localhost'; // Replace with your registered site ID with Plausible
const PLAUSIBLE_BASE_URL = 'https://plausible.apps.twoducks.dev/api'; //  This is a self-hosted Plausible instance. Replace with your own, or the cloud-based Plausible base URL (e.g. https://plausible.io/api)

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${PLAUSIBLE_API_KEY}`,
};

type PageViewsResult = {
  results: {
    [key: string]: {
      value: number;
    };
  };
};

export async function getTotalPageViews() {
  const response = await fetch(
    `${PLAUSIBLE_BASE_URL}/v1/stats/aggregate?site_id=${PLAUSIBLE_SITE_ID}&metrics=pageviews`,
    {
      method: 'GET',
      headers: headers,
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const json = await response.json() as PageViewsResult;

  return json.results.pageviews.value;
}

export async function calculateDailyChangePercentage() {
  // Calculate today, yesterday, and the day before yesterday's dates
  const today = new Date();
  const yesterday = new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0];
  const dayBeforeYesterday = new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0];

  try {
    // Fetch page views for yesterday and the day before yesterday
    const pageViewsYesterday = await getPageviewsForDate(yesterday);
    const pageViewsDayBeforeYesterday = await getPageviewsForDate(dayBeforeYesterday);

    console.table({ pageViewsYesterday, pageViewsDayBeforeYesterday, typeY: typeof pageViewsYesterday, typeDBY: typeof pageViewsDayBeforeYesterday })

    let change = 0;
    if (pageViewsYesterday === 0 || pageViewsDayBeforeYesterday === 0) {
      console.log('Page views are zero, so no percentage change');
    } else {
      change = ((pageViewsYesterday - pageViewsDayBeforeYesterday) / pageViewsDayBeforeYesterday) * 100;
    }

    console.log(`Daily change in page views percentage: ${change.toFixed(2)}%`);
    return change.toFixed(2); // Limit the number to two decimal places
  } catch (error) {
    console.error('Error calculating daily change percentage:', error);
  }
}

async function getPageviewsForDate(date: string) {
  const url = `${PLAUSIBLE_BASE_URL}/v1/stats/aggregate?site_id=${PLAUSIBLE_SITE_ID}&period=day&date=${date}&metrics=pageviews`;
  const response = await fetch(url, {
    method: 'GET',
    headers: headers,
  });
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json() as PageViewsResult;
  return data.results.pageviews.value;
}
