import { ArrowUp, UsersRound } from 'lucide-react';
import { useMemo } from 'react';
import { type DailyStatsProps } from '../../../analytics/stats';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { cn } from '../../../lib/utils';

const TotalSignupsCard = ({ dailyStats, isLoading }: DailyStatsProps) => {
  const isDeltaPositive = useMemo(() => {
    return !!dailyStats?.userDelta && dailyStats.userDelta > 0;
  }, [dailyStats]);

  return (
    <Card>
      <CardHeader>
        <div className='flex h-11.5 w-11.5 items-center justify-center rounded-full bg-muted'>
          <UsersRound className='size-6' />
        </div>
      </CardHeader>

      <CardContent className='flex justify-between'>
        <div>
          <h4 className='text-title-md font-bold text-foreground'>{dailyStats?.userCount}</h4>
          <span className='text-sm font-medium text-muted-foreground'>Total Signups</span>
        </div>

        <span
          className={cn('flex items-center gap-1 text-sm font-medium', {
            'text-success': isDeltaPositive && !isLoading,
            'text-destructive': !isDeltaPositive && !isLoading && dailyStats?.userDelta !== 0,
            'text-muted-foreground': isLoading || !dailyStats?.userDelta,
          })}
        >
          {isLoading ? '...' : dailyStats?.userDelta ?? '-'}
          {!isLoading && (dailyStats?.userDelta ?? 0) > 0 && <ArrowUp />}
        </span>
      </CardContent>
    </Card>
  );
};

export default TotalSignupsCard;
