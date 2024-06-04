import { useMemo, useEffect } from 'react';
import { UpArrow, DownArrow } from '../images/icon/icons-arrows';
import type { DailyStatsProps } from '../common/types';

const TotalRevenueCard = ({dailyStats, weeklyStats, isLoading}: DailyStatsProps) => {
  const isDeltaPositive = useMemo(() => {
    if (!weeklyStats) return false;
    return (weeklyStats[0].totalRevenue - weeklyStats[1]?.totalRevenue) > 0;
  }, [weeklyStats]);

  const deltaPercentage = useMemo(() => {
    if ( !weeklyStats || weeklyStats.length < 2 || isLoading) return;
    if ( weeklyStats[1]?.totalRevenue === 0 || weeklyStats[0]?.totalRevenue === 0 ) return 0;

    weeklyStats.sort((a, b) => b.id - a.id);

    const percentage = ((weeklyStats[0].totalRevenue - weeklyStats[1]?.totalRevenue) / weeklyStats[1]?.totalRevenue) * 100;
    return Math.floor(percentage);
  }, [weeklyStats]);

  return (
    <div className='rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark'>
      <div className='flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4'>
        <svg
          className='fill-primary dark:fill-white'
          width='20'
          height='22'
          viewBox='0 0 20 22'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M11.7531 16.4312C10.3781 16.4312 9.27808 17.5312 9.27808 18.9062C9.27808 20.2812 10.3781 21.3812 11.7531 21.3812C13.1281 21.3812 14.2281 20.2812 14.2281 18.9062C14.2281 17.5656 13.0937 16.4312 11.7531 16.4312ZM11.7531 19.8687C11.2375 19.8687 10.825 19.4562 10.825 18.9406C10.825 18.425 11.2375 18.0125 11.7531 18.0125C12.2687 18.0125 12.6812 18.425 12.6812 18.9406C12.6812 19.4219 12.2343 19.8687 11.7531 19.8687Z'
            fill=''
          />
          <path
            d='M5.22183 16.4312C3.84683 16.4312 2.74683 17.5312 2.74683 18.9062C2.74683 20.2812 3.84683 21.3812 5.22183 21.3812C6.59683 21.3812 7.69683 20.2812 7.69683 18.9062C7.69683 17.5656 6.56245 16.4312 5.22183 16.4312ZM5.22183 19.8687C4.7062 19.8687 4.2937 19.4562 4.2937 18.9406C4.2937 18.425 4.7062 18.0125 5.22183 18.0125C5.73745 18.0125 6.14995 18.425 6.14995 18.9406C6.14995 19.4219 5.73745 19.8687 5.22183 19.8687Z'
            fill=''
          />
          <path
            d='M19.0062 0.618744H17.15C16.325 0.618744 15.6031 1.23749 15.5 2.06249L14.95 6.01562H1.37185C1.0281 6.01562 0.684353 6.18749 0.443728 6.46249C0.237478 6.73749 0.134353 7.11562 0.237478 7.45937C0.237478 7.49374 0.237478 7.49374 0.237478 7.52812L2.36873 13.9562C2.50623 14.4375 2.9531 14.7812 3.46873 14.7812H12.9562C14.2281 14.7812 15.3281 13.8187 15.5 12.5469L16.9437 2.26874C16.9437 2.19999 17.0125 2.16562 17.0812 2.16562H18.9375C19.35 2.16562 19.7281 1.82187 19.7281 1.37499C19.7281 0.928119 19.4187 0.618744 19.0062 0.618744ZM14.0219 12.3062C13.9531 12.8219 13.5062 13.2 12.9906 13.2H3.7781L1.92185 7.56249H14.7094L14.0219 12.3062Z'
            fill=''
          />
        </svg>
      </div>

      <div className='mt-4 flex items-end justify-between'>
        <div>
          <h4 className='text-title-md font-bold text-black dark:text-white'>${dailyStats?.totalRevenue}</h4>
          <span className='text-sm font-medium'>Total Revenue</span>
        </div>

        <span className='flex items-center gap-1 text-sm font-medium text-meta-3'>
          {isLoading ? '...' : !!deltaPercentage ? deltaPercentage + '%' : '-'}
          {!!deltaPercentage ? isDeltaPositive ? <UpArrow /> : <DownArrow /> : null}
        </span>
      </div>
    </div>
  );
};

export default TotalRevenueCard;
