import { type DailyAnalytics } from 'wasp/entities';
import { type DailyAnalyticsJob } from 'wasp/server/jobs';
import Stripe from 'stripe';
import { stripe } from '../payment/stripe/stripeClient';
import { listOrders } from '@lemonsqueezy/lemonsqueezy.js';
import { getDailyPageViews, getSources } from './providers/plausibleAnalyticsUtils';
// import { getDailyPageViews, getSources } from './providers/googleAnalyticsUtils';
import { paymentProcessor } from '../payment/paymentProcessor';
import { SubscriptionStatus } from '../payment/plans';

export const calculateDailyAnalytics: DailyAnalyticsJob<never, void> = async (_args, context) => {
  const nowUTC = new Date(Date.now());
  nowUTC.setUTCHours(0, 0, 0, 0);

  const yesterdayUTC = new Date(nowUTC);
  yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);

  try {
    const yesterdaysAnalytics = await context.entities.DailyAnalytics.findFirst({
      where: {
        date: {
          equals: yesterdayUTC,
        },
      },
    });

    const userCount = await context.entities.User.count({});
    // users can have paid but canceled subscriptions which terminate at the end of the period
    // we don't want to count those users as current paying users
    const paidUserCount = await context.entities.User.count({
      where: {
        subscriptionStatus: SubscriptionStatus.Active,
      },
    });

    let userDelta = userCount;
    let paidUserDelta = paidUserCount;
    if (yesterdaysAnalytics) {
      userDelta -= yesterdaysAnalytics.userCount;
      paidUserDelta -= yesterdaysAnalytics.paidUserCount;
    }

    let totalRevenue;
    switch (paymentProcessor.id) {
      case 'stripe':
        totalRevenue = await fetchTotalStripeRevenue();
        break;
      case 'lemonsqueezy':
        totalRevenue = await fetchTotalLemonSqueezyRevenue();
        break;
      default:
        throw new Error(`Unsupported payment processor: ${paymentProcessor.id}`);
    }

    const { totalViews, prevDayViewsChangePercent } = await getDailyPageViews();

    let dailyAnalytics = await context.entities.DailyAnalytics.findUnique({
      where: {
        date: nowUTC,
      },
    });

    if (!dailyAnalytics) {
      console.log('No daily analytics found for today, creating one...');
      dailyAnalytics = await context.entities.DailyAnalytics.create({
        data: {
          date: nowUTC,
          totalViews,
          prevDayViewsChangePercent,
          userCount,
          paidUserCount,
          userDelta,
          paidUserDelta,
          totalRevenue,
        },
      });
    } else {
      console.log('Daily stat found for today, updating it...');
      dailyAnalytics = await context.entities.DailyAnalytics.update({
        where: {
          id: dailyAnalytics.id,
        },
        data: {
          totalViews,
          prevDayViewsChangePercent,
          userCount,
          paidUserCount,
          userDelta,
          paidUserDelta,
          totalRevenue,
        },
      });
    }
    const sources = await getSources();

    for (const source of sources) {
      let visitors = source.visitors;
      if (typeof source.visitors !== 'number') {
        visitors = parseInt(source.visitors);
      }
      await context.entities.PageViewSource.upsert({
        where: {
          date_name: {
            date: nowUTC,
            name: source.source,
          },
        },
        create: {
          date: nowUTC,
          name: source.source,
          visitors,
          dailyAnalyticsId: dailyAnalytics.id,
        },
        update: {
          visitors,
        },
      });
    }

    console.table({ dailyAnalytics });
  } catch (error: any) {
    console.error('Error calculating daily analytics: ', error);
    await context.entities.Logs.create({
      data: {
        message: `Error calculating daily analytics: ${error?.message}`,
        level: 'job-error',
      },
    });
  }
};

async function fetchTotalStripeRevenue() {
  let totalRevenue = 0;
  let params: Stripe.BalanceTransactionListParams = {
    limit: 100,
    // created: {
    //   gte: startTimestamp,
    //   lt: endTimestamp
    // },
    type: 'charge',
  };

  let hasMore = true;
  while (hasMore) {
    const balanceTransactions = await stripe.balanceTransactions.list(params);

    for (const transaction of balanceTransactions.data) {
      if (transaction.type === 'charge') {
        totalRevenue += transaction.amount;
      }
    }

    if (balanceTransactions.has_more) {
      // Set the starting point for the next iteration to the last object fetched
      params.starting_after = balanceTransactions.data[balanceTransactions.data.length - 1].id;
    } else {
      hasMore = false;
    }
  }

  // Revenue is in cents so we convert to dollars (or your main currency unit)
  return totalRevenue / 100;
}

async function fetchTotalLemonSqueezyRevenue() {
  try {
    let totalRevenue = 0;
    let hasNextPage = true;
    let currentPage = 1;

    while (hasNextPage) {
      const { data: response } = await listOrders({
        filter: {
          storeId: process.env.LEMONSQUEEZY_STORE_ID,
        },
        page: {
          number: currentPage,
          size: 100,
        },
      });

      if (response?.data) {
        for (const order of response.data) {
          totalRevenue += order.attributes.total;
        }
      }

      hasNextPage = !response?.meta?.page.lastPage;
      currentPage++;
    }

    // Revenue is in cents so we convert to dollars (or your main currency unit)
    return totalRevenue / 100;
  } catch (error) {
    console.error('Error fetching Lemon Squeezy revenue:', error);
    throw error;
  }
}
