import { type PageViewSource } from 'wasp/entities';
import { useTranslation } from 'react-i18next';

const SourcesTable = ({ sources }: { sources: PageViewSource[] | undefined }) => {
  const { t } = useTranslation();
  return (
    <div className='rounded-sm border border-border bg-card px-5 pt-6 pb-2.5 shadow-default sm:px-7.5 xl:pb-1'>
      <h4 className='mb-6 text-xl font-semibold text-foreground'>{t('admin.topSources')}</h4>

      <div className='flex flex-col'>
        <div className='grid grid-cols-3 rounded-sm bg-gray-2 '>
          <div className='p-2.5 xl:p-5'>
            <h5 className='text-sm font-medium uppercase xsm:text-base'>{t('admin.source')}</h5>
          </div>
          <div className='p-2.5 text-center xl:p-5'>
            <h5 className='text-sm font-medium uppercase xsm:text-base'>{t('admin.visitors')}</h5>
          </div>
          <div className='hidden p-2.5 text-center sm:block xl:p-5'>
            <h5 className='text-sm font-medium uppercase xsm:text-base'>{t('admin.sales')}</h5>
          </div>
        </div>

        {sources && sources.length > 0 ? (
          sources.map((source) => (
            <div className='grid grid-cols-3 border-b border-border'>
              <div className='flex items-center gap-3 p-2.5 xl:p-5'>
                <p className='text-foreground'>{source.name}</p>
              </div>

              <div className='flex items-center justify-center p-2.5 xl:p-5'>
                <p className='text-foreground'>{source.visitors}</p>
              </div>

              <div className='hidden items-center justify-center p-2.5 sm:flex xl:p-5'>
                <p className='text-foreground'>--</p>
              </div>
            </div>
          ))
        ) : (
          <div className='flex items-center justify-center p-2.5 xl:p-5'>
            <p className='text-foreground'>{t('admin.noDataToDisplay')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SourcesTable;
