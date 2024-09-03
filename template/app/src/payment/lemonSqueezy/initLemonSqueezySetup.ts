import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';
import { requireNodeEnvVar } from '../../server/utils';

export const initLemonSqueezy = () =>
  lemonSqueezySetup({
    apiKey: requireNodeEnvVar('LEMONSQUEEZY_API_KEY'),
  });
