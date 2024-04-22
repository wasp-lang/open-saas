import { Link } from 'wasp/client/router';
import { type User } from 'wasp/entities';
import { logout } from 'wasp/client/auth';
import { TierIds } from '../../shared/constants';
import { z } from 'zod';

export default function AccountPage({ user }: { user: User }) {
  return (
    <div className='mt-10 px-6'>
      <div className='overflow-hidden border border-gray-900/10 shadow-lg sm:rounded-lg lg:m-8 dark:border-gray-100/10'>
        <div className='px-4 py-5 sm:px-6 lg:px-8'>
          <h3 className='text-base font-semibold leading-6 text-gray-900 dark:text-white'>Account Information</h3>
        </div>
        <div className='border-t border-gray-900/10 dark:border-gray-100/10 px-4 py-5 sm:p-0'>
          <dl className='sm:divide-y sm:divide-gray-900/10 sm:dark:divide-gray-100/10'>
            {!!user.email && (
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6'>
                <dt className='text-sm font-medium text-gray-500 dark:text-white'>Email address</dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-400 sm:col-span-2 sm:mt-0'>{user.email}</dd>
              </div>
            )}
            {!!user.username && (
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6'>
                <dt className='text-sm font-medium text-gray-500 dark:text-white'>Username</dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-400 sm:col-span-2 sm:mt-0'>{user.username}</dd>
              </div>
            )}
            <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500 dark:text-white'>Your Plan</dt>
              {!!user.subscriptionStatus ? (
                <>
                  {user.subscriptionStatus !== 'past_due' ? (
                    <dd className='mt-1 text-sm text-gray-900 dark:text-gray-400 sm:col-span-1 sm:mt-0'>
                      {user.subscriptionTier === TierIds.HOBBY ? 'Hobby' : 'Pro'} Plan
                    </dd>
                  ) : (
                    <dd className='mt-1 text-sm text-gray-900 dark:text-gray-400 sm:col-span-1 sm:mt-0'>
                      Your Account is Past Due! Please Update your Payment Information
                    </dd>
                  )}
                  <CustomerPortalButton />
                </>
              ) : (
                <>
                  <dd className='mt-1 text-sm text-gray-900 dark:text-gray-400 sm:col-span-1 sm:mt-0'>
                    Credits remaining: {user.credits}
                  </dd>
                  <BuyMoreButton />
                </>
              )}
            </div>
            <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500 dark:text-white'>About</dt>
              <dd className='mt-1 text-sm text-gray-900 dark:text-gray-400 sm:col-span-2 sm:mt-0'>
                I'm a cool customer.
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div className='inline-flex w-full justify-end'>
        <button
          onClick={logout}
          className='inline-flex justify-center mx-8 py-2 px-4 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        >
          logout
        </button>
      </div>
    </div>
  );
}

function BuyMoreButton() {
  return (
    <div className='ml-4 flex-shrink-0 sm:col-span-1 sm:mt-0'>
      <Link to='/pricing' className='font-medium text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500'>
        Buy More/Upgrade
      </Link>
    </div>
  );
}

function CustomerPortalButton() {
  const handleClick = () => {
    try {
      const schema = z.string().url();
      const customerPortalUrl = schema.parse(import.meta.env.REACT_APP_STRIPE_CUSTOMER_PORTAL);
      window.open(customerPortalUrl, '_blank');
    } catch (err) {
      console.error(err)
    }
  };

  return (
    <div className='ml-4 flex-shrink-0 sm:col-span-1 sm:mt-0'>
      <button onClick={handleClick} className='font-medium text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300'>
        Manage Subscription
      </button>
    </div>
  );
}
