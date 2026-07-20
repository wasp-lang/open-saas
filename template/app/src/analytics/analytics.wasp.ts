import { job, query, type Spec } from "@wasp.sh/spec";

import { getDailyStats } from "./operations" with { type: "ref" };
import { calculateDailyStatsJob } from "./stats" with { type: "ref" };

export const analyticsSpec: Spec = [
  query(getDailyStats, { entities: ["User", "DailyStats"] }),
  job(calculateDailyStatsJob, {
    executor: "PgBoss",
    schedule: {
      cron: "0 * * * *", // Every hour. useful in production.
      // cron: "* * * * *" // Every minute. useful for debugging.
    },
    entities: ["User", "DailyStats", "Logs", "PageViewSource"],
  }),
];
