import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'wasp/client/auth';
import { generateCheckoutSession, getCustomerPortalUrl, useQuery } from 'wasp/client/operations';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardTitle } from '../components/ui/card';
import { cn } from '../lib/utils';
import { PaymentPlanId, paymentPlans, prettyPaymentPlanName, SubscriptionStatus } from './plans';

const bestDealPaymentPlanId: PaymentPlanId = PaymentPlanId.Pro;

interface PaymentPlanCard {
  name: string;
  price: string;
  description: string;
  features: string[];
}

// 使用函数来获取翻译后的计划卡片
export const getPaymentPlanCards = (t: (key: string) => string): Record<PaymentPlanId, PaymentPlanCard> => ({
  [PaymentPlanId.Hobby]: {
    name: t('pricing.planNames.hobby'),
    price: '$9.99',
    description: t('pricing.plans.hobby.description'),
    features: [t('pricing.plans.hobby.features.limitedUsage'), t('pricing.plans.hobby.features.basicSupport')],
  },
  [PaymentPlanId.Pro]: {
    name: t('pricing.planNames.pro'),
    price: '$19.99',
    description: t('pricing.plans.pro.description'),
    features: [t('pricing.plans.pro.features.unlimitedUsage'), t('pricing.plans.pro.features.prioritySupport')],
  },
  [PaymentPlanId.Credits10]: {
    name: t('pricing.planNames.credits10'),
    price: '$9.99',
    description: t('pricing.plans.credits10.description'),
    features: [t('pricing.plans.credits10.features.useCredits'), t('pricing.plans.credits10.features.noExpiration')],
  },
});

// 保留旧的导出以保持向后兼容性
export const paymentPlanCards: Record<PaymentPlanId, PaymentPlanCard> = {
  [PaymentPlanId.Hobby]: {
    name: prettyPaymentPlanName(PaymentPlanId.Hobby),
    price: '$9.99',
    description: 'All you need to get started',
    features: ['Limited monthly usage', 'Basic support'],
  },
  [PaymentPlanId.Pro]: {
    name: prettyPaymentPlanName(PaymentPlanId.Pro),
    price: '$19.99',
    description: 'Our most popular plan',
    features: ['Unlimited monthly usage', 'Priority customer support'],
  },
  [PaymentPlanId.Credits10]: {
    name: prettyPaymentPlanName(PaymentPlanId.Credits10),
    price: '$9.99',
    description: 'One-time purchase of 10 credits for your account',
    features: ['Use credits for e.g. OpenAI API calls', 'No expiration date'],
  },
};

const PricingPage = () => {
  const { t } = useTranslation();
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: user } = useAuth();
  const isUserSubscribed =
    !!user && !!user.subscriptionStatus && user.subscriptionStatus !== SubscriptionStatus.Deleted;

  const paymentPlanCards = getPaymentPlanCards(t);

  const {
    data: customerPortalUrl,
    isLoading: isCustomerPortalUrlLoading,
    error: customerPortalUrlError,
  } = useQuery(getCustomerPortalUrl, { enabled: isUserSubscribed });

  const navigate = useNavigate();

  async function handleBuyNowClick(paymentPlanId: PaymentPlanId) {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setIsPaymentLoading(true);

      const checkoutResults = await generateCheckoutSession(paymentPlanId);

      if (checkoutResults?.sessionUrl) {
        window.open(checkoutResults.sessionUrl, '_self');
      } else {
        throw new Error(t('pricing.errorGeneratingCheckout'));
      }
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(t('pricing.errorProcessingPayment'));
      }
      setIsPaymentLoading(false); // We only set this to false here and not in the try block because we redirect to the checkout url within the same window
    }
  }

  const handleCustomerPortalClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (customerPortalUrlError) {
      setErrorMessage(t('pricing.errorFetchingPortal'));
      return;
    }

    if (!customerPortalUrl) {
      setErrorMessage(t('pricing.errorPortalNotExist', { userId: user.id }));
      return;
    }

    window.open(customerPortalUrl, '_blank');
  };

  return (
    <div className='py-10 lg:mt-10'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div id='pricing' className='mx-auto max-w-4xl text-center'>
          <h2 className='mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>
            {t('pricing.title')}
          </h2>
        </div>
        <p className='mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-muted-foreground'>
          {t('pricing.subtitle')} <br />
          <span className='px-2 py-1 bg-muted rounded-md text-muted-foreground font-mono text-sm'>
            {t('pricing.testCardNumber')}
          </span>
        </p>
        {errorMessage && (
          <Alert variant='destructive' className='mt-8'>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <div className='isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 lg:gap-x-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3'>
          {Object.values(PaymentPlanId).map((planId) => (
            <Card
              key={planId}
              className={cn(
                'relative flex flex-col grow justify-between overflow-hidden transition-all duration-300 hover:shadow-lg',
                {
                  'ring-2 ring-primary !bg-transparent': planId === bestDealPaymentPlanId,
                  'ring-1 ring-border lg:my-8': planId !== bestDealPaymentPlanId,
                }
              )}
            >
              {planId === bestDealPaymentPlanId && (
                <div
                  className='absolute top-0 right-0 -z-10 w-full h-full transform-gpu blur-3xl'
                  aria-hidden='true'
                >
                  <div
                    className='absolute w-full h-full bg-gradient-to-br from-primary/40 via-primary/20 to-primary/10 opacity-30'
                    style={{
                      clipPath: 'circle(670% at 50% 50%)',
                    }}
                  />
                </div>
              )}
              <CardContent className='p-8 xl:p-10 h-full justify-between'>
                <div className='flex items-center justify-between gap-x-4'>
                  <CardTitle id={planId} className='text-foreground text-lg font-semibold leading-8'>
                    {paymentPlanCards[planId].name}
                  </CardTitle>
                </div>
                <p className='mt-4 text-sm leading-6 text-muted-foreground'>
                  {paymentPlanCards[planId].description}
                </p>
                <p className='mt-6 flex items-baseline gap-x-1'>
                  <span className='text-4xl font-bold tracking-tight text-foreground'>
                    {paymentPlanCards[planId].price}
                  </span>
                  <span className='text-sm font-semibold leading-6 text-muted-foreground'>
                    {paymentPlans[planId].effect.kind === 'subscription' && t('pricing.perMonth')}
                  </span>
                </p>
                <ul role='list' className='mt-8 space-y-3 text-sm leading-6 text-muted-foreground'>
                  {paymentPlanCards[planId].features.map((feature) => (
                    <li key={feature} className='flex gap-x-3'>
                      <CheckCircle className='h-5 w-5 flex-none text-primary' aria-hidden='true' />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isUserSubscribed ? (
                  <Button
                    onClick={handleCustomerPortalClick}
                    disabled={isCustomerPortalUrlLoading}
                    aria-describedby='manage-subscription'
                    variant={planId === bestDealPaymentPlanId ? 'default' : 'outline'}
                    className='w-full'
                  >
                    {t('pricing.manageSubscription')}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleBuyNowClick(planId)}
                    aria-describedby={planId}
                    variant={planId === bestDealPaymentPlanId ? 'default' : 'outline'}
                    className='w-full'
                    disabled={isPaymentLoading}
                  >
                    {!!user ? t('pricing.buyPlan') : t('pricing.loginToBuyPlan')}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
