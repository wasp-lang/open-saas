import { type DailyAnalytics } from 'wasp/entities';

export type DailyAnalyticsProps = {
  dailyAnalytics?: DailyAnalytics;
  dailyAnalyticsFromPastWeek?: DailyAnalytics[];
  isLoading?: boolean;
}; 