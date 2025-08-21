import { Polar } from '@polar-sh/sdk';
import { getPolarApiConfig } from './config';

function shouldUseSandboxMode(): boolean {
  const explicitSandboxMode = process.env.POLAR_SANDBOX_MODE;

  if (explicitSandboxMode !== undefined) {
    return explicitSandboxMode === 'true';
  }

  return process.env.NODE_ENV !== 'production';
}

export const polarClient = new Polar({
  accessToken: getPolarApiConfig().accessToken,
  server: shouldUseSandboxMode() ? 'sandbox' : 'production',
});
