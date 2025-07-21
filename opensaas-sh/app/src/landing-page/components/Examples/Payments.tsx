import payments from '../../../client/static/assets/payments.png';
import HighlightedFeature from '../HighlightedFeature';

export default function Payments() {
  return (
    <HighlightedFeature
      name='Stripe / Lemon Squeezy Integration'
      description="No SaaS is complete without payments. We've pre-configured checkout and webhooks. Just choose a provider and start cashing out."
      highlightedComponent={<PaymentsExample />}
      direction='row-reverse'
    />
  );
}

const PaymentsExample = () => {
  return (
    <div className='w-full max-w-lg'>
      <img src={payments} alt='Payments' />
    </div>
  );
};
