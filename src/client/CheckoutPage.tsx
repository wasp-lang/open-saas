import { User } from '@wasp/entities';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

export default function CheckoutPage({ user }: { user: User }) {
  const [hasPaid, setHasPaid] = useState('loading');

  const history = useHistory();

  useEffect(() => {
    function delayedRedirect() {
      return setTimeout(() => {
        history.push('/account');
      }, 4000);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const cancel = urlParams.get('canceled');
    const success = urlParams.get('success');
    const credits = urlParams.get('credits');
    if (cancel) {
      setHasPaid('canceled');
    } else if (success) {
      setHasPaid('paid');
    } else {
      history.push('/account');
    }
    delayedRedirect();
    return () => {
      clearTimeout(delayedRedirect());
    };
  }, []);

  return (
    <div className='flex min-h-full flex-col justify-center mt-10 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow-xl ring-1 ring-gray-900/10 sm:rounded-lg sm:px-10'>
          <h1>
            {hasPaid === 'paid'
              ? '🥳 Payment Successful!'
              : hasPaid === 'canceled'
              ? '😢 Payment Canceled'
              : hasPaid === 'error' && '🙄 Payment Error'}
          </h1>
          {hasPaid !== 'loading' && (
            <span className='text-center'>
              You are being redirected to your account page... <br />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
