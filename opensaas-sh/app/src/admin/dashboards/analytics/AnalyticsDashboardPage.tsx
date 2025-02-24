import { Link } from 'wasp/client/router';
import { type AuthUser } from 'wasp/auth';
import { useState, useEffect, useMemo } from 'react';
import { useQuery, getDailyStats } from 'wasp/client/operations';
import TotalSignupsCard from './TotalSignupsCard';
import TotalPageViewsCard from './TotalPageViewsCard';
import TotalPayingUsersCard from './TotalPayingUsersCard';
import TotalRevenueCard from './TotalRevenueCard';
import RevenueAndProfitChart from './RevenueAndProfitChart';
import SourcesTable from './SourcesTable';
import DefaultLayout from '../../layout/DefaultLayout';
import { useRedirectHomeUnlessUserIsAdmin } from '../../useRedirectHomeUnlessUserIsAdmin';
import { cn } from '../../../client/cn';

const Dashboard = ({ user }: { user: AuthUser }) => {
  const [isDemoInfoVisible, setIsDemoInfoVisible] = useState(false);
  useRedirectHomeUnlessUserIsAdmin({ user });

  const { data: stats, isLoading, error } = useQuery(getDailyStats);

  const didUserCloseDemoInfo = localStorage.getItem('didUserCloseDemoInfo') === 'true';

  useEffect(() => {
    if (didUserCloseDemoInfo || !stats) {
      setIsDemoInfoVisible(false);
    } else if (!didUserCloseDemoInfo && stats) {
      setIsDemoInfoVisible(true);
    }
  }, [stats]);

  const handleDemoInfoClose = () => {
    try {
      localStorage.setItem('didUserCloseDemoInfo', 'true');
      setIsDemoInfoVisible(false);
    } catch (error) {
      console.error(error);
    }
  };

  const sortedSources = useMemo(() => {
    return stats?.dailyStats?.sources?.slice().sort((a, b) => b.visitors - a.visitors);
  }, [stats?.dailyStats?.sources]);

  return (
    <DefaultLayout user={user}>
      {isDemoInfoVisible && (
        <div className='fixed z-999 bottom-0 mb-2 left-1/2 -translate-x-1/2 lg:mb-4 bg-gray-700 rounded-full px-3.5 py-2 text-sm text-white duration-300 ease-in-out hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600'>
          <div className='px-4 flex flex-row gap-2 items-center my-1'>
            <span className='text-gray-100 text-center'>
              This is actual data from Stripe test purchases. <br /> Try out purchasing a{' '}
              <Link to='/pricing' className='underline text-yellow-400'>
                test product
              </Link>
              !
            </span>
            <button className=' pl-2.5 text-gray-400 text-xl font-bold' onClick={() => handleDemoInfoClose()}>
              X
            </button>
          </div>
        </div>
      )}
      <div className='relative'>
        <div
          className={cn({
            'opacity-25': !stats,
          })}
        >
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5'>
            <TotalPageViewsCard
              totalPageViews={stats?.dailyStats.totalViews}
              prevDayViewsChangePercent={stats?.dailyStats.prevDayViewsChangePercent}
            />
            <TotalRevenueCard
              dailyStats={stats?.dailyStats}
              weeklyStats={stats?.weeklyStats}
              isLoading={isLoading}
            />
            <TotalPayingUsersCard dailyStats={stats?.dailyStats} isLoading={isLoading} />
            <TotalSignupsCard dailyStats={stats?.dailyStats} isLoading={isLoading} />
          </div>

          <div className='mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5'>
            <RevenueAndProfitChart weeklyStats={stats?.weeklyStats} isLoading={isLoading} />

            <div className='col-span-12 xl:col-span-8'>
              <SourcesTable sources={sortedSources} />
            </div>
          </div>
        </div>

        {!stats && (
          <div className='absolute inset-0 flex items-start justify-center bg-white/50 dark:bg-boxdark-2/50'>
            <div className='rounded-lg bg-white p-8 shadow-lg dark:bg-boxdark'>
              <p className='text-2xl font-bold text-boxdark dark:text-white'>No daily stats generated yet</p>
              <p className='mt-2 text-sm text-bodydark2'>
                Stats will appear here once the daily stats job has run
              </p>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
