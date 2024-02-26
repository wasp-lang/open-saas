import { type DailyStats } from 'wasp/entities';

export type DailyStatsProps = { dailyStats?: DailyStats; weeklyStats?: DailyStats[]; isLoading?: boolean };
