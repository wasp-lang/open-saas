import { listOrders } from "@lemonsqueezy/lemonsqueezy.js";
import Stripe from "stripe";
import { type DailyStats } from "wasp/entities";
import { type DailyStatsJob } from "wasp/server/jobs";
import { stripeClient } from "../payment/stripe/stripeClient";
import {
  getDailyPageViews,
  getSources,
} from "./providers/plausibleAnalyticsUtils";
// import { getDailyPageViews, getSources } from './providers/googleAnalyticsUtils';
import { OrderStatus } from "@polar-sh/sdk/models/components/orderstatus.js";
import { paymentProcessor } from "../payment/paymentProcessor";
import { SubscriptionStatus } from "../payment/plans";
import { polarClient } from "../payment/polar/polarClient";
import { assertUnreachable } from "../shared/utils";

export type DailyStatsProps = {
  dailyStats?: DailyStats;
  weeklyStats?: DailyStats[];
  isLoading?: boolean;
};

export const calculateDailyStats: DailyStatsJob<never, void> = async (
  _args,
  context,
) => {
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
        subscriptionStatus: SubscriptionStatus.Active,
      },
    });

    let userDelta = userCount;
    let paidUserDelta = paidUserCount;
    if (yesterdaysStats) {
      userDelta -= yesterdaysStats.userCount;
      paidUserDelta -= yesterdaysStats.paidUserCount;
    }

    let totalRevenue;
    switch (paymentProcessor.id) {
      case "stripe":
        totalRevenue = await fetchTotalStripeRevenue();
        break;
      case "lemonsqueezy":
        totalRevenue = await fetchTotalLemonSqueezyRevenue();
        break;
      case "polar":
        totalRevenue = await fetchTotalPolarRevenue();
        break;
      default:
        assertUnreachable(paymentProcessor.id);
    }

    const { totalViews, prevDayViewsChangePercent } = await getDailyPageViews();

    let dailyStats = await context.entities.DailyStats.findUnique({
      where: {
        date: nowUTC,
      },
    });

    if (!dailyStats) {
      console.log("No daily stat found for today, creating one...");
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
      console.log("Daily stat found for today, updating it...");
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
      if (typeof source.visitors !== "number") {
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
    console.error("Error calculating daily stats: ", error);
    await context.entities.Logs.create({
      data: {
        message: `Error calculating daily stats: ${error?.message}`,
        level: "job-error",
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
    type: "charge",
  };

  let hasMore = true;
  while (hasMore) {
    const balanceTransactions =
      await stripeClient.balanceTransactions.list(params);

    for (const transaction of balanceTransactions.data) {
      if (transaction.type === "charge") {
        totalRevenue += transaction.amount;
      }
    }

    if (balanceTransactions.has_more) {
      // Set the starting point for the next iteration to the last object fetched
      params.starting_after =
        balanceTransactions.data[balanceTransactions.data.length - 1].id;
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
    console.error("Error fetching Lemon Squeezy revenue:", error);
    throw error;
  }
}

async function fetchTotalPolarRevenue(): Promise<number> {
  let totalRevenue = 0;

  const result = await polarClient.orders.list({
    limit: 100,
  });

  for await (const page of result) {
    const orders = page.result.items || [];

    for (const order of orders) {
      if (order.status === OrderStatus.Paid && order.totalAmount > 0) {
        totalRevenue += order.totalAmount;
      }
    }
  }

  // Revenue is in cents so we convert to dollars
  return totalRevenue / 100;
}
