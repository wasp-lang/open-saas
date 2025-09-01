import { type AuthUser } from 'wasp/auth';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '../../layout/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import { useRedirectHomeUnlessUserIsAdmin } from '../../useRedirectHomeUnlessUserIsAdmin';

const Calendar = ({ user }: { user: AuthUser }) => {
  useRedirectHomeUnlessUserIsAdmin({ user });
  const { t } = useTranslation();

  return (
    <DefaultLayout user={user}>
      <Breadcrumb pageName={t('admin.calendar')} />
      <div className='w-full max-w-full rounded-sm border border-border bg-card shadow-default'>
        <table className='w-full'>
          <thead>
            <tr className='grid grid-cols-7 rounded-t-sm bg-primary text-primary-foreground'>
              <th className='flex h-15 items-center justify-center rounded-tl-sm p-1 text-xs font-semibold sm:text-base xl:p-5'>
                <span className='hidden lg:block'> {t('admin.sunday')} </span>
                <span className='block lg:hidden'> {t('admin.sun')} </span>
              </th>
              <th className='flex h-15 items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5'>
                <span className='hidden lg:block'> {t('admin.monday')} </span>
                <span className='block lg:hidden'> {t('admin.mon')} </span>
              </th>
              <th className='flex h-15 items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5'>
                <span className='hidden lg:block'> {t('admin.tuesday')} </span>
                <span className='block lg:hidden'> {t('admin.tue')} </span>
              </th>
              <th className='flex h-15 items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5'>
                <span className='hidden lg:block'> {t('admin.wednesday')} </span>
                <span className='block lg:hidden'> {t('admin.wed')} </span>
              </th>
              <th className='flex h-15 items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5'>
                <span className='hidden lg:block'> {t('admin.thursday')} </span>
                <span className='block lg:hidden'> {t('admin.thu')} </span>
              </th>
              <th className='flex h-15 items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5'>
                <span className='hidden lg:block'> {t('admin.friday')} </span>
                <span className='block lg:hidden'> {t('admin.fri')} </span>
              </th>
              <th className='flex h-15 items-center justify-center rounded-tr-sm p-1 text-xs font-semibold sm:text-base xl:p-5'>
                <span className='hidden lg:block'> {t('admin.saturday')} </span>
                <span className='block lg:hidden'> {t('admin.sat')} </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {/* <!-- Line 1 --> */}
            <tr className='grid grid-cols-7'>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>1</span>
                <div className='group h-16 w-full flex-grow cursor-pointer py-1 md:h-30'>
                  <span className='group-hover:text-primary md:hidden'>More</span>
                  <div className='event invisible absolute left-2 z-99 mb-1 flex w-[200%] flex-col rounded-sm border-l-[3px] border-primary bg-muted px-3 py-1 text-left opacity-0 group-hover:visible group-hover:opacity-100 md:visible md:w-[190%] md:opacity-100'>
                    <span className='event-name text-sm font-semibold text-foreground'>Redesign Website</span>
                    <span className='time text-sm font-medium text-foreground'>1 Dec - 2 Dec</span>
                  </div>
                </div>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>2</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>3</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>4</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>5</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>6</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>7</span>
              </td>
            </tr>
            {/* <!-- Line 1 --> */}
            {/* <!-- Line 2 --> */}
            <tr className='grid grid-cols-7'>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>8</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>9</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>10</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>11</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>12</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>13</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>14</span>
              </td>
            </tr>
            {/* <!-- Line 2 --> */}
            <tr className='grid grid-cols-7'>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>15</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>16</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>17</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>18</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>19</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>20</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>21</span>
              </td>
            </tr>
            {/* <!-- Line 3 --> */}
            <tr className='grid grid-cols-7'>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>22</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>23</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>24</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>25</span>
                <div className='group h-16 w-full flex-grow cursor-pointer py-1 md:h-30'>
                  <span className='group-hover:text-primary md:hidden'>More</span>
                  <div className='event invisible absolute left-2 z-99 mb-1 flex w-[300%] flex-col rounded-sm border-l-[3px] border-primary bg-muted px-3 py-1 text-left opacity-0 group-hover:visible group-hover:opacity-100 md:visible md:w-[290%] md:opacity-100'>
                    <span className='event-name text-sm font-semibold text-foreground'>App Design</span>
                    <span className='time text-sm font-medium text-foreground'>25 Dec - 27 Dec</span>
                  </div>
                </div>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>26</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>27</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>28</span>
              </td>
            </tr>
            {/* <!-- Line 4 --> */}
            <tr className='grid grid-cols-7'>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>29</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>30</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>31</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>1</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>2</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>3</span>
              </td>
              <td className='ease relative h-20 cursor-pointer border border-border p-2 transition duration-500 text-accent hover:bg-accent hover:text-accent-foreground md:h-25 md:p-6 xl:h-31'>
                <span className='font-medium'>4</span>
              </td>
            </tr>
            {/* <!-- Line 5 --> */}
          </tbody>
        </table>
      </div>
    </DefaultLayout>
  );
};

export default Calendar;
