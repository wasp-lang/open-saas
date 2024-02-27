import { useAuth } from 'wasp/client/auth';
import { stripePayment } from 'wasp/client/operations';
import { TierIds, STRIPE_CUSTOMER_PORTAL_LINK } from '../../shared/constants';
import { AiFillCheckCircle } from 'react-icons/ai';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';

export const tiers = [
  {
    name: 'Hobby',
    id: TierIds.HOBBY,
    priceMonthly: '$9.99',
    description: 'All you need to get started',
    features: ['Limited monthly usage', 'Basic support'],
  },
  {
    name: 'Pro',
    id: TierIds.PRO,
    priceMonthly: '$19.99',
    description: 'Our most popular plan',
    features: ['Unlimited monthly usage', 'Priority customer support'],
    bestDeal: true,
  },
  {
    name: 'Enterprise',
    id: TierIds.ENTERPRISE,
    priceMonthly: '$500',
    description: 'Big business means big money',
    features: ['Unlimited monthly usage', '24/7 customer support', 'Advanced analytics'],
  },
];

const PricingPage = () => {
  const [isStripePaymentLoading, setIsStripePaymentLoading] = useState<boolean | string>(false);

  const { data: user, isLoading: isUserLoading } = useAuth();

  const history = useHistory();

  async function handleBuyNowClick(tierId: string) {
    if (!user) {
      history.push('/login');
      return;
    }
    try {
      setIsStripePaymentLoading(tierId);
      let stripeResults = await stripePayment(tierId);

      if (stripeResults?.sessionUrl) {
        window.open(stripeResults.sessionUrl, '_self');
      }
    } catch (error: any) {
      console.error(error?.message ?? 'Something went wrong.');
    } finally {
      setIsStripePaymentLoading(false);
    }
  }

  return (
    <div className='py-10 lg:mt-10'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div id='pricing' className='mx-auto max-w-4xl text-center'>
          <h2 className='mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white'>
            Pick your <span className='text-yellow-500'>pricing</span>
          </h2>
        </div>
        <p className='mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-white'>
          Stripe subscriptions and secure webhooks are built-in. Just add your Stripe Product IDs! Try it out below with
          test credit card number{' '}
          <span className='px-2 py-1 bg-gray-100 rounded-md text-gray-500'>4242 4242 4242 4242 4242</span>
        </p>
        <div className='isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 lg:gap-x-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3'>
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col  ${
                tier.bestDeal ? 'ring-2' : 'ring-1 lg:mt-8'
              } grow justify-between rounded-3xl ring-gray-900/10 dark:ring-gray-100/10 overflow-hidden p-8 xl:p-10`}
            >
              {tier.bestDeal && (
                <div className='absolute top-0 right-0 -z-10 w-full h-full transform-gpu blur-3xl' aria-hidden='true'>
                  <div
                    className='absolute w-full h-full bg-gradient-to-br from-amber-400 to-purple-300 opacity-30 dark:opacity-50'
                    style={{
                      clipPath: 'circle(670% at 50% 50%)',
                    }}
                  />
                </div>
              )}
              <div className='mb-8'>
                <div className='flex items-center justify-between gap-x-4'>
                  <h3 id={tier.id} className='text-gray-900 text-lg font-semibold leading-8 dark:text-white'>
                    {tier.name}
                  </h3>
                </div>
                <p className='mt-4 text-sm leading-6 text-gray-600 dark:text-white'>{tier.description}</p>
                <p className='mt-6 flex items-baseline gap-x-1 dark:text-white'>
                  <span className='text-4xl font-bold tracking-tight text-gray-900 dark:text-white'>
                    {tier.priceMonthly}
                  </span>
                  <span className='text-sm font-semibold leading-6 text-gray-600 dark:text-white'>/month</span>
                </p>
                <ul role='list' className='mt-8 space-y-3 text-sm leading-6 text-gray-600 dark:text-white'>
                  {tier.features.map((feature) => (
                    <li key={feature} className='flex gap-x-3'>
                      <AiFillCheckCircle className='h-6 w-5 flex-none text-yellow-500' aria-hidden='true' />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              {!!user && user.hasPaid ? (
                <a
                  href={STRIPE_CUSTOMER_PORTAL_LINK}
                  aria-describedby='manage-subscription'
                  className={`
                      ${tier.id === 'enterprise-tier' ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}
                      ${
                        tier.bestDeal
                          ? 'bg-yellow-500 text-white hover:text-white shadow-sm hover:bg-yellow-400'
                          : 'text-gray-600  ring-1 ring-inset ring-purple-200 hover:ring-purple-400'
                      }
                      'mt-8 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400'
                    `}
                >
                  {tier.id === 'enterprise-tier' ? 'Contact us' : 'Manage Subscription'}
                </a>
              ) : (
                <button
                  onClick={() => handleBuyNowClick(tier.id)}
                  aria-describedby={tier.id}
                  className={`dark:text-white
                      ${tier.id === 'enterprise-tier' ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}
                      ${
                        tier.bestDeal
                          ? 'bg-yellow-500 text-white hover:text-white shadow-sm hover:bg-yellow-400'
                          : 'text-gray-600  ring-1 ring-inset ring-purple-200 hover:ring-purple-400'
                      }
                      ${isStripePaymentLoading === tier.id ? 'cursor-wait' : null}
                      'mt-8 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400'
                    `}
                >
                  {tier.id === 'enterprise-tier' ? 'Contact us' : !!user ? 'Buy plan' : 'Log in to buy plan'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
