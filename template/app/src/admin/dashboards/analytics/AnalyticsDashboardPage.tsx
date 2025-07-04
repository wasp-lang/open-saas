import { type AuthUser } from 'wasp/auth';
import { useQuery, getAnalyticsDataByDay } from 'wasp/client/operations';
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
  useRedirectHomeUnlessUserIsAdmin({ user });

  const { data: analyticsData, isLoading, error } = useQuery(getAnalyticsDataByDay);

  return (
    <DefaultLayout user={user}>
      <div className='relative'>
        <div className={cn({
          'opacity-25': !analyticsData,
        })}>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5'>
            <TotalPageViewsCard
              totalPageViews={analyticsData?.todaysAnalyticsData.totalViews}
              prevDayViewsChangePercent={analyticsData?.todaysAnalyticsData.prevDayViewsChangePercent}
            />
            <TotalRevenueCard
              dailyAnalytics={analyticsData?.todaysAnalyticsData}
              dailyAnalyticsFromPastWeek={analyticsData?.dailyAnalyticsFromPastWeek}
              isLoading={isLoading}
            />
            <TotalPayingUsersCard dailyAnalytics={analyticsData?.todaysAnalyticsData} isLoading={isLoading} />
            <TotalSignupsCard dailyAnalytics={analyticsData?.todaysAnalyticsData} isLoading={isLoading} />
          </div>

          <div className='mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5'>
            <RevenueAndProfitChart dailyAnalyticsFromPastWeek={analyticsData?.dailyAnalyticsFromPastWeek} isLoading={isLoading} />

            <div className='col-span-12 xl:col-span-8'>
              <SourcesTable sources={analyticsData?.todaysAnalyticsData?.pageViewSources} />
            </div>
          </div>
        </div>

        {!analyticsData && (
          <div className='absolute inset-0 flex items-start justify-center bg-white/50 dark:bg-boxdark-2/50'>
            <div className='rounded-lg bg-white p-8 shadow-lg dark:bg-boxdark'>
              <p className='text-2xl font-bold text-boxdark dark:text-white'>
                No daily analytics found yet
              </p>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
