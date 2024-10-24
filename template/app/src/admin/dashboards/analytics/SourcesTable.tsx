import { type PageViewSource } from 'wasp/entities';

const SourcesTable = ({ sources }: { sources: PageViewSource[] | undefined }) => {
  return (
    <div className='rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1'>
      <h4 className='mb-6 text-xl font-semibold text-black dark:text-white'>Top Sources</h4>

      <div className='flex flex-col'>
        <div className='grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 '>
          <div className='p-2.5 xl:p-5'>
            <h5 className='text-sm font-medium uppercase xsm:text-base'>Source</h5>
          </div>
          <div className='p-2.5 text-center xl:p-5'>
            <h5 className='text-sm font-medium uppercase xsm:text-base'>Visitors</h5>
          </div>
          <div className='hidden p-2.5 text-center sm:block xl:p-5'>
            <h5 className='text-sm font-medium uppercase xsm:text-base'>Sales</h5>
          </div>
        </div>

        {sources && sources.length > 0 ? (
          sources.map((source) => (
            <div className='grid grid-cols-3 border-b border-stroke dark:border-strokedark'>
              <div className='flex items-center gap-3 p-2.5 xl:p-5'>
                <p className='text-black dark:text-white'>{source.name}</p>
              </div>

              <div className='flex items-center justify-center p-2.5 xl:p-5'>
                <p className='text-black dark:text-white'>{source.visitors}</p>
              </div>

              <div className='hidden items-center justify-center p-2.5 sm:flex xl:p-5'>
                <p className='text-black dark:text-white'>--</p>
              </div>
            </div>
          ))
        ) : (
          <div className='flex items-center justify-center p-2.5 xl:p-5'>
            <p className='text-black dark:text-white'>No data to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SourcesTable;
