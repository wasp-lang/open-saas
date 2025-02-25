import { SubscriptionStatus } from '../../../payment/plans';
import { useQuery, getPaginatedUsers } from 'wasp/client/operations';
import { useState, useEffect } from 'react';
import SwitcherOne from '../../elements/forms/SwitcherOne';
import LoadingSpinner from '../../layout/LoadingSpinner';
import DropdownEditDelete from './DropdownEditDelete';
import { updateIsUserAdminById } from 'wasp/client/operations';
import { type User } from 'wasp/entities';

function AdminSwitch({ id, isAdmin }: Pick<User, 'id' | 'isAdmin'>) {
  return (
    <SwitcherOne isOn={isAdmin} onChange={(value) => updateIsUserAdminById({ id: id, isAdmin: value })} />
  );
}

const UsersTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [emailFilter, setEmailFilter] = useState<string | undefined>(undefined);
  const [isAdminFilter, setIsAdminFilter] = useState<boolean | undefined>(undefined);
  const [subscriptionStatusFilter, setSubcriptionStatusFilter] = useState<Array<SubscriptionStatus | null>>(
    []
  );

  const skipPages = currentPage - 1;

  const { data, isLoading } = useQuery(getPaginatedUsers, {
    skipPages,
    filter: {
      ...(emailFilter && { emailContains: emailFilter }),
      ...(isAdminFilter !== undefined && { isAdmin: isAdminFilter }),
      ...(subscriptionStatusFilter.length > 0 && { subscriptionStatusIn: subscriptionStatusFilter }),
    },
  });

  useEffect(
    function backToPageOne() {
      setCurrentPage(1);
    },
    [emailFilter, subscriptionStatusFilter, isAdminFilter]
  );

  return (
    <div className='flex flex-col gap-4'>
      <div className='rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
        <div className='flex-col flex items-start justify-between p-6 gap-3 w-full bg-gray-100/40 dark:bg-gray-700/50'>
          <span className='text-sm font-medium'>Filters:</span>
          <div className='flex items-center justify-between gap-3 w-full px-2'>
            <div className='relative flex items-center gap-3 '>
              <label htmlFor='email-filter' className='block text-sm text-gray-700 dark:text-white'>
                email:
              </label>
              <input
                type='text'
                id='email-filter'
                placeholder='dude@example.com'
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setEmailFilter(value === '' ? undefined : value);
                }}
                className='rounded border border-stroke py-2 px-5 bg-white outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
              />
              <label htmlFor='status-filter' className='block text-sm ml-2 text-gray-700 dark:text-white'>
                status:
              </label>
              <div className='flex-grow relative z-20 rounded border border-stroke pr-8 outline-none bg-white transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input'>
                <div className='flex items-center'>
                  {subscriptionStatusFilter.length > 0 ? (
                    subscriptionStatusFilter.map((opt) => (
                      <span
                        key={opt}
                        className='z-30 flex items-center my-1 mx-2 py-1 px-2 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
                      >
                        {opt ? opt : 'has not subscribed'}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setSubcriptionStatusFilter((prevValue) => {
                              return prevValue?.filter((val) => val !== opt);
                            });
                          }}
                          className='z-30 cursor-pointer pl-2 hover:text-danger'
                        >
                          <XIcon />
                        </span>
                      </span>
                    ))
                  ) : (
                    <span className='bg-white text-gray-500 py-2 px-5 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'>
                      Select Status Filters
                    </span>
                  )}
                </div>
                <select
                  onChange={(e) => {
                    const selectedValue = e.target.value == 'has_not_subscribed' ? null : e.target.value;

                    console.log(selectedValue);
                    if (selectedValue === 'clear-all') {
                      setSubcriptionStatusFilter([]);
                    } else {
                      setSubcriptionStatusFilter((prevValue) => {
                        if (prevValue.includes(selectedValue as SubscriptionStatus)) {
                          return prevValue.filter((val) => val !== selectedValue);
                        } else {
                          return [...prevValue, selectedValue as SubscriptionStatus];
                        }
                      });
                    }
                  }}
                  name='status-filter'
                  id='status-filter'
                  className='absolute top-0 left-0 z-20 h-full w-full bg-white opacity-0'
                >
                  <option value='select-filters'>Select filters</option>
                  {[...Object.values(SubscriptionStatus), null]
                    .filter((status) => !subscriptionStatusFilter.includes(status))
                    .map((status) => {
                      const extendedStatus = status ?? 'has_not_subscribed'
                      return <option key={extendedStatus} value={extendedStatus}>
                        {extendedStatus}
                      </option>
                    })}
                </select>
                <span className='absolute top-1/2 right-4 z-10 -translate-y-1/2'>
                  <ChevronDownIcon />
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <label htmlFor='isAdmin-filter' className='block text-sm ml-2 text-gray-700 dark:text-white'>
                  isAdmin:
                </label>
                <select
                  name='isAdmin-filter'
                  onChange={(e) => {
                    if (e.target.value === 'both') {
                      setIsAdminFilter(undefined);
                    } else {
                      setIsAdminFilter(e.target.value === 'true');
                    }
                  }}
                  className='relative z-20 w-full appearance-none rounded border border-stroke bg-white p-2 pl-4 pr-8  outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input'
                >
                  <option value='both'>both</option>
                  <option value='true'>true</option>
                  <option value='false'>false</option>
                </select>
              </div>
            </div>
            {!isLoading && (
              <div className='max-w-60'>
                <span className='text-md mr-2 text-black dark:text-white'>page</span>
                <input
                  type='number'
                  min={1}
                  defaultValue={currentPage}
                  max={data?.totalPages}
                  onChange={(e) => {
                    const value = parseInt(e.currentTarget.value);
                    if (data?.totalPages && value <= data?.totalPages && value > 0) {
                      setCurrentPage(value);
                    }
                  }}
                  className='rounded-md border-1 border-stroke bg-transparent  px-4 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
                />
                <span className='text-md text-black dark:text-white'> / {data?.totalPages} </span>
              </div>
            )}
          </div>
        </div>

        <div className='grid grid-cols-9 border-t-4  border-stroke py-4.5 px-4 dark:border-strokedark md:px-6 '>
          <div className='col-span-3 flex items-center'>
            <p className='font-medium'>Email / Username</p>
          </div>
          <div className='col-span-2 flex items-center'>
            <p className='font-medium'>Subscription Status</p>
          </div>
          <div className='col-span-2 flex items-center'>
            <p className='font-medium'>Stripe ID</p>
          </div>
          <div className='col-span-1 flex items-center'>
            <p className='font-medium'>Is Admin</p>
          </div>
          <div className='col-span-1 flex items-center'>
            <p className='font-medium'></p>
          </div>
        </div>
        {isLoading && (
          <div className='-mt-40'>
            <LoadingSpinner />
          </div>
        )}
        {!!data?.users &&
          data?.users?.length > 0 &&
          data.users.map((user) => (
            <div
              key={user.id}
              className='grid grid-cols-9 gap-4 border-t border-stroke py-4.5 px-4 dark:border-strokedark  md:px-6 '
            >
              <div className='col-span-3 flex items-center'>
                <div className='flex flex-col gap-1 '>
                  <p className='text-sm text-black dark:text-white'>{user.email}</p>
                  <p className='text-sm text-black dark:text-white'>{user.username}</p>
                </div>
              </div>
              <div className='col-span-2 flex items-center'>
                <p className='text-sm text-black dark:text-white'>{user.subscriptionStatus}</p>
              </div>
              <div className='col-span-2 flex items-center'>
                <p className='text-sm text-meta-3'>{user.paymentProcessorUserId}</p>
              </div>
              <div className='col-span-1 flex items-center'>
                <div className='text-sm text-black dark:text-white'>
                  <AdminSwitch {...user} />
                </div>
              </div>
              <div className='col-span-1 flex items-center'>
                <DropdownEditDelete />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

function ChevronDownIcon() {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <g opacity='0.8'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z'
          fill='#637381'
        ></path>
      </g>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width='14' height='14' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M9.35355 3.35355C9.54882 3.15829 9.54882 2.84171 9.35355 2.64645C9.15829 2.45118 8.84171 2.45118 8.64645 2.64645L6 5.29289L3.35355 2.64645C3.15829 2.45118 2.84171 2.45118 2.64645 2.64645C2.45118 2.84171 2.45118 3.15829 2.64645 3.35355L5.29289 6L2.64645 8.64645C2.45118 8.84171 2.45118 9.15829 2.64645 9.35355C2.84171 9.54882 3.15829 9.54882 3.35355 9.35355L6 6.70711L8.64645 9.35355C8.84171 9.54882 9.15829 9.54882 9.35355 9.35355C9.54882 9.15829 9.54882 8.84171 9.35355 8.64645L6.70711 6L9.35355 3.35355Z'
        fill='currentColor'
      ></path>
    </svg>
  );
}

export default UsersTable;
