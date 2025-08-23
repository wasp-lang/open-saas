import { Polar } from '@polar-sh/sdk';
import { requireNodeEnvVar } from '../../server/utils';

function shouldUseSandboxMode(): boolean {
  const explicitSandboxMode = process.env.POLAR_SANDBOX_MODE;

  if (explicitSandboxMode !== undefined) {
    return explicitSandboxMode === 'true';
  }

  return process.env.NODE_ENV !== 'production';
}

export const polarClient = new Polar({
  accessToken: requireNodeEnvVar('POLAR_ACCESS_TOKEN'),
  server: shouldUseSandboxMode() ? 'sandbox' : 'production',
});
