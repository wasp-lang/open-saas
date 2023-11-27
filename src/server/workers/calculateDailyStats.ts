import type { DailyStats } from '@wasp/jobs/dailyStats';
import Stripe from 'stripe';
import { getTotalPageViews, getPrevDayViewsChangePercent, getSources } from './analyticsUtils.js';

const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: '2022-11-15', // TODO find out where this is in the Stripe dashboard and document
});

export const calculateDailyStats: DailyStats<never, void> = async (_args, context) => {
  const nowUTC = new Date(Date.now());
  nowUTC.setUTCHours(0, 0, 0, 0);

  const yesterdayUTC = new Date(nowUTC);
  yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);

  console.log('yesterdayUTC: ', yesterdayUTC);
  console.log('nowUTC: ', nowUTC);

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
        hasPaid: true,
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
    const { totalViews, prevDayViewsChangePercent } = await getDailyPageviews();

    const newDailyStat = await context.entities.DailyStats.upsert({
      where: {
        date: nowUTC,
      },
      create: {
        date: nowUTC,
        totalViews,
        prevDayViewsChangePercent: prevDayViewsChangePercent || '0',
        userCount,
        paidUserCount,
        userDelta,
        paidUserDelta,
        totalRevenue,
      },
      update: {
        totalViews,
        prevDayViewsChangePercent: prevDayViewsChangePercent || '0' ,
        userCount,
        paidUserCount,
        userDelta,
        paidUserDelta,
        totalRevenue,
      },
    });

    const sources = await getSources();

    for (const source of sources) {
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
          visitors: source.visitors,
          dailyStatsId: newDailyStat.id,
        },
        update: {
          visitors: source.visitors,
        },
      });
    }

    console.table({ newDailyStat })

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
  const formattedRevenue = (totalRevenue / 100)
  return formattedRevenue;
}

async function getDailyPageviews() {
    const totalViews = await getTotalPageViews()
    const prevDayViewsChangePercent = await getPrevDayViewsChangePercent();

    return {
      totalViews,
      prevDayViewsChangePercent,
    };
}