import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type PaymentStatus = 'loading' | 'paid' | 'canceled';

const ACCOUNT_PAGE_REDIRECT_DELAY_MS = 4000;

export default function CheckoutResultPage() {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('loading');
  const { search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(search);
    const isSuccess = queryParams.get('success');
    const isCanceled = queryParams.get('canceled');

    if (isCanceled) {
      setPaymentStatus('canceled');
    } else if (isSuccess) {
      setPaymentStatus('paid');
    } else {
      navigate('/account');
    }

    const accountPageRedirectTimeoutId = setTimeout(() => {
      navigate('/account');
    }, ACCOUNT_PAGE_REDIRECT_DELAY_MS);

    return () => {
      clearTimeout(accountPageRedirectTimeoutId);
    };
  }, [search]);

  return (
    <div className='mt-10 sm:mx-6 flex flex-col items-stretch sm:items-center'>
      <div className='sm:max-w-md text-center py-8 px-4 shadow-xl ring-1 ring-gray-900/10 dark:ring-gray-100/10 sm:rounded-lg sm:px-10 flex flex-col gap-4'>
        <h1 className='text-xl font-semibold'>
          {paymentStatus === 'paid' && '🥳 Payment Successful!'}
          {paymentStatus === 'canceled' && '😢 Payment Canceled'}
        </h1>
        {paymentStatus !== 'loading' && (
          <span className=''>
            You are being redirected to your account page in {ACCOUNT_PAGE_REDIRECT_DELAY_MS / 1000}{' '}
            seconds... <br />
          </span>
        )}
      </div>
    </div>
  );
}
