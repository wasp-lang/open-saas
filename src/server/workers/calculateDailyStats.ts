import type { DailyStats } from '@wasp/jobs/dailyStats';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: '2022-11-15', // TODO find out where this is in the Stripe dashboard and document
});

export const calculateDailyStats: DailyStats<never, void> = async (_args, context) => {
  const currentDate = new Date();
  const yesterdaysDate = new Date(new Date().setDate(currentDate.getDate() - 1));

  try {
    const yesterdaysStats = await context.entities.DailyStats.findFirst({
      where: {
        date: {
          equals: yesterdaysDate,
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

    await context.entities.DailyStats.upsert({
      where: {
        date: currentDate,
      },
      create: {
        date: currentDate,
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
  } catch (error) {
    console.error('Error calculating daily stats: ', error);
  }
};

async function fetchDailyStripeRevenue() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0); // Sets to beginning of day
  const startOfDayTimestamp = Math.floor(startOfDay.getTime() / 1000); // Convert to Unix timestamp in seconds

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999); // Sets to end of day
  const endOfDayTimestamp = Math.floor(endOfDay.getTime() / 1000); // Convert to Unix timestamp in seconds

  let nextPageCursor = undefined;
  const allPayments = [] as Stripe.Invoice[];

  while (true) {
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

  const lastTotalEntry = await context.entities.DailyStats.find({
    where: {
      // date is yesterday
      date: {
        equals: new Date(new Date().setDate(new Date().getDate() - 1)),
      },
    },
  });

  let newRunningTotal = revenueInDollars;
  if (lastTotalEntry) {
    newRunningTotal += lastTotalEntry.totalRevenue;
  }

  return newRunningTotal;
}
