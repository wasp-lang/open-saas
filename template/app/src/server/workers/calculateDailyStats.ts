import { type DailyStatsJob } from 'wasp/server/jobs';
import Stripe from 'stripe';
import { getDailyPageViews, getSources } from './plausibleAnalyticsUtils.js';
// import { getDailyPageViews, getSources } from './googleAnalyticsUtils.js';

const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: '2022-11-15', // TODO find out where this is in the Stripe dashboard and document
});

export const calculateDailyStats: DailyStatsJob<never, void> = async (_args, context) => {
  const nowUTC = new Date(Date.now());
  nowUTC.setUTCHours(0, 0, 0, 0);

  const yesterdayUTC = new Date(nowUTC);
  yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);

  try {
    const yesterdaysStats = await context.entities.DailyStats.findFirst({
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
        subscriptionStatus: 'active',
      },
    });

    let userDelta = userCount;
    let paidUserDelta = paidUserCount;
    if (yesterdaysStats) {
      userDelta -= yesterdaysStats.userCount;
      paidUserDelta -= yesterdaysStats.paidUserCount;
    }

    const totalRevenue = await fetchTotalStripeRevenue();
    const { totalViews, prevDayViewsChangePercent } = await getDailyPageViews();

    let dailyStats = await context.entities.DailyStats.findUnique({
      where: {
        date: nowUTC,
      },
    });

    if (!dailyStats) {
      console.log('No daily stat found for today, creating one...');
      dailyStats = await context.entities.DailyStats.create({
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
      dailyStats = await context.entities.DailyStats.update({
        where: {
          id: dailyStats.id,
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
          dailyStatsId: dailyStats.id,
        },
        update: {
          visitors,
        },
      });
    }

    console.table({ dailyStats });
  } catch (error: any) {
    console.error('Error calculating daily stats: ', error);
    await context.entities.Logs.create({
      data: {
        message: `Error calculating daily stats: ${error?.message}`,
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
  const formattedRevenue = totalRevenue / 100;
  return formattedRevenue;
}
