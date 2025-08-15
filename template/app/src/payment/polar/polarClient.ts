import { Polar } from '@polar-sh/sdk';
import { getPolarApiConfig, shouldUseSandboxMode } from './config';

/**
 * Polar SDK client instance configured with environment variables
 * Automatically handles sandbox vs production environment selection
 */
export const polar = new Polar({
  accessToken: getPolarApiConfig().accessToken,
  server: shouldUseSandboxMode() ? 'sandbox' : 'production',
});

/**
 * Validates that the Polar client is properly configured
 * @throws Error if configuration is invalid or client is not accessible
 */
export function validatePolarClient(): void {
  const config = getPolarApiConfig();
  
  if (!config.accessToken) {
    throw new Error('Polar access token is required but not configured');
  }
  
  if (!config.organizationId) {
    throw new Error('Polar organization ID is required but not configured');
  }
} 