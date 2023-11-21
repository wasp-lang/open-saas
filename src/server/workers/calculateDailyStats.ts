import type { DailyStats } from '@wasp/jobs/dailyStats';
import Stripe from 'stripe';

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

    const newRunningTotal = await calculateTotalRevenue(context);

    const newDailyStat = await context.entities.DailyStats.upsert({
      where: {
        date: nowUTC,
      },
      create: {
        date: nowUTC,
        userCount,
        paidUserCount,
        userDelta,
        paidUserDelta,
        totalRevenue: newRunningTotal,
      },
      update: {
        userCount,
        paidUserCount,
        userDelta,
        paidUserDelta,
        totalRevenue: newRunningTotal,
      },
    });

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

async function fetchDailyStripeRevenue() {
  const startOfDayUTC = new Date(Date.now());
  startOfDayUTC.setHours(0, 0, 0, 0); // Sets to beginning of day
  const startOfDayTimestamp = Math.floor(startOfDayUTC.getTime() / 1000); // Convert to Unix timestamp in seconds

  const endOfDayUTC = new Date();
  endOfDayUTC.setHours(23, 59, 59, 999); // Sets to end of day
  const endOfDayTimestamp = Math.floor(endOfDayUTC.getTime() / 1000); // Convert to Unix timestamp in seconds

  let nextPageCursor = undefined;
  const allPayments = [] as Stripe.Invoice[];

  while (true) {
    // Stripe allows searching for invoices by date range via their Query Language
    // If there are more than 100 invoices in a day, we need to paginate through them
    const params = {
      query: `created>=${startOfDayTimestamp} AND created<=${endOfDayTimestamp} AND status:"paid"`,
      limit: 100,
      page: nextPageCursor,
    };
    const payments = await stripe.invoices.search(params);

    if (payments.next_page) {
      nextPageCursor = payments.next_page;
    }

    console.log('\n\nstripe invoice payments: ', payments, '\n\n');

    payments.data.forEach((invoice) => allPayments.push(invoice));

    if (!payments.has_more) {
      break;
    }
  }

  const dailyTotalInCents = allPayments.reduce((total, invoice) => {
    return total + invoice.amount_paid;
  }, 0);

  return dailyTotalInCents;
}

async function calculateTotalRevenue(context: any) {
  const revenueInCents = await fetchDailyStripeRevenue();

  const revenueInDollars = revenueInCents / 100;
  
  // we use UTC time to avoid issues with local timezones
  const nowUTC = new Date(Date.now());

  // Set the time component to midnight in UTC
  // This way we can pass the Date object directly to Prisma
  // without having to convert it to a string
  nowUTC.setUTCHours(0, 0, 0, 0);

  // Get yesterday's date by subtracting one day
  const yesterdayUTC = new Date(nowUTC);
  yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);

  const lastTotalEntry = await context.entities.DailyStats.findUnique({
    where: {
      date: yesterdayUTC, // Pass the Date object directly, not as a string
    },
  });

  let newRunningTotal = revenueInDollars;
  if (lastTotalEntry) {
    newRunningTotal += lastTotalEntry.totalRevenue;
  }

  return newRunningTotal;
}
