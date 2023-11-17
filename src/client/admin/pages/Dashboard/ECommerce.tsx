import TotalSignupsCard from '../../components/TotalSignupsCard';
import TotalPageViewsCard from '../../components/TotalPaidViewsCard';
import TotalPayingUsersCard from '../../components/TotalPayingUsersCard';
import TotalRevenueCard from '../../components/TotalRevenueCard';
import RevenueAndProfitChart from '../../components/RevenueAndProfitChart';
import ReferrerTable from '../../components/ReferrerTable';
import DefaultLayout from '../../layout/DefaultLayout';
import { useQuery } from '@wasp/queries';
import getDailyStats from '@wasp/queries/getDailyStats';

const ECommerce = () => {
  const { data: stats, isLoading, error } = useQuery(getDailyStats);

  return (
    <DefaultLayout>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5'>
        <TotalPageViewsCard />
        <TotalRevenueCard dailyStats={stats?.dailyStats} weeklyStats={stats?.weeklyStats} isLoading={isLoading} />
        <TotalPayingUsersCard dailyStats={stats?.dailyStats} isLoading={isLoading} />
        <TotalSignupsCard dailyStats={stats?.dailyStats} isLoading={isLoading} />
      </div>

      <div className='mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5'>
        <RevenueAndProfitChart weeklyStats={stats?.weeklyStats} isLoading={isLoading} />

        <div className='col-span-12 xl:col-span-8'>
          <ReferrerTable />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ECommerce;
