import { type User } from 'wasp/entities';
import { useQuery, getDailyStats } from 'wasp/client/operations';
import TotalSignupsCard from '../components/TotalSignupsCard';
import TotalPageViewsCard from '../components/TotalPaidViewsCard';
import TotalPayingUsersCard from '../components/TotalPayingUsersCard';
import TotalRevenueCard from '../components/TotalRevenueCard';
import RevenueAndProfitChart from '../components/RevenueAndProfitChart';
import SourcesTable from '../components/SourcesTable';
import DefaultLayout from '../layout/DefaultLayout';
import { useHistory } from 'react-router-dom';

const Dashboard = ({ user }: { user: User }) => {
  const history = useHistory();
  if (!user.isAdmin) {
    history.push('/');
  }

  const { data: stats, isLoading, error } = useQuery(getDailyStats);

  return (
    <DefaultLayout>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5'>
        <TotalPageViewsCard
          totalPageViews={stats?.dailyStats.totalViews}
          prevDayViewsChangePercent={stats?.dailyStats.prevDayViewsChangePercent}
        />
        <TotalRevenueCard dailyStats={stats?.dailyStats} weeklyStats={stats?.weeklyStats} isLoading={isLoading} />
        <TotalPayingUsersCard dailyStats={stats?.dailyStats} isLoading={isLoading} />
        <TotalSignupsCard dailyStats={stats?.dailyStats} isLoading={isLoading} />
      </div>

      <div className='mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5'>
        <RevenueAndProfitChart weeklyStats={stats?.weeklyStats} isLoading={isLoading} />

        <div className='col-span-12 xl:col-span-8'>
          <SourcesTable sources={stats?.dailyStats?.sources} />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
