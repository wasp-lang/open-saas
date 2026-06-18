import { options } from "@wasp.sh/file-based-routing";

export default options({
  job: {
    executor: "PgBoss",
    schedule: {
      cron: "0 * * * *", // every hour. useful in production
      // cron: "* * * * *" // every minute. useful for debugging
    },
    entities: ["User", "DailyStats", "Logs", "PageViewSource"],
  },
});
