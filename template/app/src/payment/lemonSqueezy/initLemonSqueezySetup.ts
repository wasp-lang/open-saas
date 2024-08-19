import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';
import { requireNodeEnvVar } from '../../server/utils';

export const initLemonSqueezy = () => lemonSqueezySetup({
  apiKey: requireNodeEnvVar('PAYMENTS_API_KEY'),
});
