import { job, query, type Part } from '@wasp.sh/spec'

import { getDailyStats } from './operations' with { type: 'ref' }
import { calculateDailyStats } from './stats' with { type: 'ref' }

export const analyticsParts: Part[] = [
  query(getDailyStats, { entities: ['User', 'DailyStats'] }),
  job(calculateDailyStats, {
    executor: 'PgBoss',
    schedule: {
      cron: '0 * * * *', // every hour. useful in production
      // cron: '* * * * *' // every minute. useful for debugging
    },
    entities: ['User', 'DailyStats', 'Logs', 'PageViewSource'],
  }),
]
