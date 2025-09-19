import { Paddle, Environment } from '@paddle/paddle-node-sdk';
import { requireNodeEnvVar } from '../../server/utils';

const env = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox';

export const paddle = new Paddle(requireNodeEnvVar('PADDLE_API_KEY'), {
  environment: env as Environment,
});
