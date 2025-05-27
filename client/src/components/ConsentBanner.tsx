import { useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Basic GDPR/consent banner. Shows once until accepted.
 * TODO: Persist acceptance using storage adapter.
 */
export default function ConsentBanner() {
  const [accepted, setAccepted] = useState(false);

  if (accepted) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 p-4 bg-gray-900 text-white text-center z-50">
      <p className="mb-2 text-sm">We use cookies to improve your experience.</p>
      <Button
        onClick={() => {
          setAccepted(true);
          // TODO: persist acceptance
        }}
        className="bg-tcof-teal hover:bg-tcof-teal/90"
      >
        Accept
      </Button>
    </div>
  );
}
