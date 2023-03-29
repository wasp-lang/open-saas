import { User } from '@wasp/entities';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

export default function CheckoutPage({ user }: { user: User }) {
  const [hasPaid, setHasPaid] = useState('loading');

  const history = useHistory();

  useEffect(() => {

    function delayedRedirect() {
      return setTimeout(() => {
        history.push('/profile');
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
      history.push('/profile');
    }
    delayedRedirect();
    return () => {
      clearTimeout(delayedRedirect());
    };
  }, []);

  return (
    <>
      <h1>
        {hasPaid === 'paid'
          ? '🥳 Payment Successful!'
          : hasPaid === 'canceled'
          ? '😢 Payment Canceled'
          : hasPaid === 'error' && '🙄 Payment Error'}
      </h1>
      {hasPaid !== 'loading' && (
        <span className='text-center'>
          You are being redirected to your profile page... <br />
        </span>
      )}
    </>
  );
}
