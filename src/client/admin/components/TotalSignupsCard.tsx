import { useMemo } from 'react';
import { UpArrow } from '../images/icon/icons-arrows';
import type { DailyStatsProps } from '../common/types';

const TotalSignupsCard = ({ dailyStats, isLoading }: DailyStatsProps) => {
  const isDeltaPositive = useMemo(() => {
    return !!dailyStats?.userDelta && dailyStats.userDelta > 0;
  }, [dailyStats]);

  return (
    <div className='rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark'>
      <div className='flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4'>
        <svg
          className='fill-primary dark:fill-white'
          width='22'
          height='18'
          viewBox='0 0 22 18'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M7.18418 8.03751C9.31543 8.03751 11.0686 6.35313 11.0686 4.25626C11.0686 2.15938 9.31543 0.475006 7.18418 0.475006C5.05293 0.475006 3.2998 2.15938 3.2998 4.25626C3.2998 6.35313 5.05293 8.03751 7.18418 8.03751ZM7.18418 2.05626C8.45605 2.05626 9.52168 3.05313 9.52168 4.29063C9.52168 5.52813 8.49043 6.52501 7.18418 6.52501C5.87793 6.52501 4.84668 5.52813 4.84668 4.29063C4.84668 3.05313 5.9123 2.05626 7.18418 2.05626Z'
            fill=''
          />
          <path
            d='M15.8124 9.6875C17.6687 9.6875 19.1468 8.24375 19.1468 6.42188C19.1468 4.6 17.6343 3.15625 15.8124 3.15625C13.9905 3.15625 12.478 4.6 12.478 6.42188C12.478 8.24375 13.9905 9.6875 15.8124 9.6875ZM15.8124 4.7375C16.8093 4.7375 17.5999 5.49375 17.5999 6.45625C17.5999 7.41875 16.8093 8.175 15.8124 8.175C14.8155 8.175 14.0249 7.41875 14.0249 6.45625C14.0249 5.49375 14.8155 4.7375 15.8124 4.7375Z'
            fill=''
          />
          <path
            d='M15.9843 10.0313H15.6749C14.6437 10.0313 13.6468 10.3406 12.7874 10.8563C11.8593 9.61876 10.3812 8.79376 8.73115 8.79376H5.67178C2.85303 8.82814 0.618652 11.0625 0.618652 13.8469V16.3219C0.618652 16.975 1.13428 17.4906 1.7874 17.4906H20.2468C20.8999 17.4906 21.4499 16.9406 21.4499 16.2875V15.4625C21.4155 12.4719 18.9749 10.0313 15.9843 10.0313ZM2.16553 15.9438V13.8469C2.16553 11.9219 3.74678 10.3406 5.67178 10.3406H8.73115C10.6562 10.3406 12.2374 11.9219 12.2374 13.8469V15.9438H2.16553V15.9438ZM19.8687 15.9438H13.7499V13.8469C13.7499 13.2969 13.6468 12.7469 13.4749 12.2313C14.0937 11.7844 14.8499 11.5781 15.6405 11.5781H15.9499C18.0812 11.5781 19.8343 13.3313 19.8343 15.4625V15.9438H19.8687Z'
            fill=''
          />
        </svg>
      </div>

      <div className='mt-4 flex items-end justify-between'>
        <div>
          <h4 className='text-title-md font-bold text-black dark:text-white'>{dailyStats?.userCount}</h4>
          <span className='text-sm font-medium'>Total Signups</span>
        </div>

        <span
          className={`flex items-center gap-1 text-sm font-medium ${isDeltaPositive ? 'text-meta-3' : 'text-meta-5'}`}
        >
          {isLoading ? '...' : isDeltaPositive ? dailyStats?.userDelta : '-'}
          {!!dailyStats && isDeltaPositive && <UpArrow />}
        </span>
      </div>
    </div>
  );
};

export default TotalSignupsCard;
