# Background Jobs

Complete job guide URLs are available in the [Wasp LLM-optimized documentation](https://wasp.sh/llms.txt).

## Existing Example

Reference the `dailyStatsJob` in this template:
- Declaration: [`../../../app/main.wasp`](../../../app/main.wasp) (search for `job dailyStatsJob`)
- Implementation: [`../../../app/src/analytics/stats.ts`](../../../app/src/analytics/stats.ts)

## Adding a Job

### 1. Declare in main.wasp

```wasp
job myJob {
  executor: PgBoss,
  perform: {
    fn: import { myJobFn } from "@src/jobs/myJob"
  },
  schedule: {
    cron: "0 * * * *"  // hourly
  },
  entities: [EntityName]  // entities accessed in job
}
```

### 2. Implement the Job

Create `src/jobs/myJob.ts`:

```typescript
import type { MyJob } from 'wasp/server/jobs'

export const myJobFn: MyJob<never, void> = async (_args, context) => {
  // Access entities via context.entities.EntityName
  // Use try/catch and log errors
}
```

## Common Cron Patterns

| Schedule | Cron |
|----------|------|
| Every minute | `* * * * *` |
| Every hour | `0 * * * *` |
| Daily at midnight | `0 0 * * *` |
| Weekly (Sunday) | `0 0 * * 0` |

## Manual Invocation

Jobs can be triggered manually from operations:

```typescript
import { myJob } from 'wasp/server/jobs'

await myJob.submit({})  // or with args
```

## Troubleshooting

**Job not running:** Verify PostgreSQL is running (jobs use pg-boss queue)

**Entities undefined:** Add to `entities: [...]` array in job declaration

**Debugging:** Use `* * * * *` cron for every-minute execution during development
