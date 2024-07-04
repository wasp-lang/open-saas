import type { User } from 'wasp/entities';
import type { SubscriptionStatusOptions } from '../../shared/types';
import { SubscriptionPlanId } from '../../shared/constants'; 
import { Link } from 'wasp/client/router';
import { logout } from 'wasp/client/auth';
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
              <UserCurrentSubscriptionStatus {...user} />
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

function UserCurrentSubscriptionStatus(user: User) {
  const prettyPrintSubscriptionPlan = (userSubscriptionPlan: User['subscriptionPlan']) => {
    const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
    if (!userSubscriptionPlan) console.error('User subscription plan is missing');
    if (userSubscriptionPlan === SubscriptionPlanId.Hobby) {
      return capitalizeFirstLetter(SubscriptionPlanId.Hobby);
    }
    if (userSubscriptionPlan === SubscriptionPlanId.Pro) {
      return capitalizeFirstLetter(SubscriptionPlanId.Hobby);
    }
  };

  const prettyPrintEndOfBillingPeriod = (date: Date | null) => {
    if (!date) {
      console.error('User date paid is missing');
      return '.';
    }
    const oneMonthFromNow = new Date(date);
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    return ': ' + oneMonthFromNow.toLocaleDateString();
  };

  function getSubscriptionMessage(subscriptionStatus: User['subscriptionStatus']) {
    const plan = prettyPrintSubscriptionPlan(user.subscriptionPlan);
    const endOfBillingPeriod = prettyPrintEndOfBillingPeriod(user.datePaid);

    // TODO: refactor this as a Record<SubscriptionStatusOptions, string> instead of a switch statement?
    switch (subscriptionStatus) {
      case 'active' satisfies SubscriptionStatusOptions:
        return `${plan}`;
      case 'past_due' satisfies SubscriptionStatusOptions:
        return `Payment for your ${plan} plan is past due! Please update your subscription payment information.`;
      case 'cancel_at_period_end' satisfies SubscriptionStatusOptions:
        return `Your ${plan} plan subscription has been canceled, but remains active until the end of the current billing period${endOfBillingPeriod}`;
      case 'deleted' satisfies SubscriptionStatusOptions:
        return `Your previous subscription has been canceled and is no longer active.`;
    }
  }

  if (user.subscriptionStatus) {
    return (
      <>
        <dd className='mt-1 text-sm text-gray-900 dark:text-gray-400 sm:col-span-1 sm:mt-0'>
          {getSubscriptionMessage(user.subscriptionStatus)}
        </dd>
        {user.subscriptionStatus !== ('deleted' satisfies SubscriptionStatusOptions) ? <CustomerPortalButton /> : <BuyMoreButton />}
      </>
    );
  }

  return (
    <>
      <dd className='mt-1 text-sm text-gray-900 dark:text-gray-400 sm:col-span-1 sm:mt-0'>
        Credits remaining: {user.credits}
      </dd>
      <BuyMoreButton />
    </>
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
      console.error(err);
    }
  };

  return (
    <div className='ml-4 flex-shrink-0 sm:col-span-1 sm:mt-0'>
      <button
        onClick={handleClick}
        className='font-medium text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300'
      >
        Manage Subscription
      </button>
    </div>
  );
}
