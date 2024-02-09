import { Link } from "wasp/client/router";
import { type User } from "wasp/entities";
import { useQuery, getDailyStats } from "wasp/client/operations";
import { useState, useEffect } from 'react';
import TotalSignupsCard from '../components/TotalSignupsCard';
import TotalPageViewsCard from '../components/TotalPaidViewsCard';
import TotalPayingUsersCard from '../components/TotalPayingUsersCard';
import TotalRevenueCard from '../components/TotalRevenueCard';
import RevenueAndProfitChart from '../components/RevenueAndProfitChart';
import SourcesTable from '../components/SourcesTable';
import DefaultLayout from '../layout/DefaultLayout';
import { useHistory } from 'react-router-dom';

const Dashboard = ({ user }: { user: User }) => {
  const [isDemoInfoVisible, setIsDemoInfoVisible] = useState(false);

  const history = useHistory();
  if (!user.isAdmin) {
    history.push('/');
  }

  const { data: stats, isLoading, error } = useQuery(getDailyStats);


  useEffect(() => {
    try {
      if (localStorage.getItem('isStripeDemoInfoVisible') === 'false') {
        // do nothing
      } else {
        setIsDemoInfoVisible(true);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleDemoInfoClose = () => {
    try {
      localStorage.setItem('isStripeDemoInfoVisible', 'false');
      setIsDemoInfoVisible(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DefaultLayout>
      {/* Floating Demo Announcement */}
      {isDemoInfoVisible && (
        <div className='fixed z-999 bottom-0 mb-2 left-1/2 -translate-x-1/2 lg:mb-4 bg-gray-700 rounded-full px-3.5 py-2 text-sm text-white duration-300 ease-in-out hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600'>
          <div className='px-4 flex flex-row gap-2 items-center my-1'>
            <span className='text-gray-100 text-center'>This is actual data from Stripe test purchases. <br/> Try out purchasing a <Link to='/pricing' className="underline text-yellow-400">test product</Link>!</span>
            <button className=' pl-2.5 text-gray-400 text-xl font-bold' onClick={() => handleDemoInfoClose()}>
              X
            </button>
          </div>
        </div>
      )}
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
