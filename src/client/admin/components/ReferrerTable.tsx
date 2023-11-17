import { useQuery } from '@wasp/queries';
import getReferrerStats from '@wasp/queries/getReferrerStats';

// We're using a simple, in-house analytics system that tracks referrers and page views.
// You could instead set up Google Analytics or Plausible and use their API for more detailed stats.
const ReferrerTable = () => {
  const { data: referrers, isLoading: isReferrersLoading, error: referrersError } = useQuery(getReferrerStats);

  return (
    <div className='rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1'>
      
      <h4 className='mb-6 text-xl font-semibold text-black dark:text-white'>Top Referrers</h4>

      <div className='flex flex-col'>
        <div className='grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-4'>
          <div className='p-2.5 xl:p-5'>
            <h5 className='text-sm font-medium uppercase xsm:text-base'>Source</h5>
          </div>
          <div className='p-2.5 text-center xl:p-5'>
            <h5 className='text-sm font-medium uppercase xsm:text-base'>Visitors</h5>
          </div>
          <div className='p-2.5 text-center xl:p-5'>
            <h5 className='text-sm font-medium uppercase xsm:text-base'>Conversion</h5>
            <span className='text-xs font-normal text-gray-600 whitespace-nowrap'>% of visitors that register</span>
          </div>
          <div className='hidden p-2.5 text-center sm:block xl:p-5'>
            <h5 className='text-sm font-medium uppercase xsm:text-base'>Sales</h5>
          </div>
        </div>

        {referrers &&
          referrers.length > 0 &&
          referrers.map((ref) => (
            <div className='grid grid-cols-3 border-b border-stroke dark:border-strokedark sm:grid-cols-4'>
              <div className='flex items-center gap-3 p-2.5 xl:p-5'>
                <p className='text-black dark:text-white'>{ref.name}</p>
              </div>

              <div className='flex items-center justify-center p-2.5 xl:p-5'>
                <p className='text-black dark:text-white'>{ref.count}</p>
              </div>

              <div className='flex items-center justify-center p-2.5 xl:p-5'>
                <p className='text-meta-3'>{ref.users.length > 0 ? Math.round((ref.users.length / ref.count)*100) : '0'}%</p>
              </div>

              <div className='hidden items-center justify-center p-2.5 sm:flex xl:p-5'>
                <p className='text-black dark:text-white'>--</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ReferrerTable;
