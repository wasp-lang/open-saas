import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function CheckoutPage() {
  const [paymentStatus, setPaymentStatus] = useState('loading');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function delayedRedirect() {
      return setTimeout(() => {
        navigate('/account');
      }, 4000);
    }

    const queryParams = new URLSearchParams(location.search);
    const isSuccess = queryParams.get('success');
    const isCanceled = queryParams.get('canceled');

    if (isCanceled) {
      setPaymentStatus('canceled');
    } else if (isSuccess) {
      setPaymentStatus('paid');
    } else {
      navigate('/account');
    }
    delayedRedirect();
    return () => {
      clearTimeout(delayedRedirect());
    };
  }, [location]);

  return (
    <div className='flex min-h-full flex-col justify-center mt-10 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='py-8 px-4 shadow-xl ring-1 ring-gray-900/10 dark:ring-gray-100/10 sm:rounded-lg sm:px-10'>
          <h1>
            {paymentStatus === 'paid'
              ? '🥳 Payment Successful!'
              : paymentStatus === 'canceled'
                ? '😢 Payment Canceled'
                : paymentStatus === 'error' && '🙄 Payment Error'}
          </h1>
          {paymentStatus !== 'loading' && (
            <span className='text-center'>
              You are being redirected to your account page... <br />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
