import { Customer } from '@polar-sh/sdk/models/components/customer.js';
import { env } from 'wasp/server';
import { polarClient } from './polarClient';

interface CreatePolarCheckoutSessionArgs {
  productId: string;
  customerId: string;
}

interface PolarCheckoutSession {
  id: string;
  url: string;
}

export async function createPolarCheckoutSession({
  productId,
  customerId,
}: CreatePolarCheckoutSessionArgs): Promise<PolarCheckoutSession> {
  const baseUrl = env.WASP_WEB_CLIENT_URL.replace(/\/+$/, '');
  const checkoutSession = await polarClient.checkouts.create({
    products: [productId],
    successUrl: `${baseUrl}/checkout?success=true`,
    metadata: {
      source: baseUrl,
    },
    customerId,
  });

  return {
    id: checkoutSession.id,
    url: checkoutSession.url,
  };
}

export async function ensurePolarCustomer(
  externalUserId: string,
  externalUserEmail: string
): Promise<Customer> {
  try {
    const existingCustomer = await polarClient.customers.getExternal({
      externalId: externalUserId,
    });

    if (existingCustomer) {
      console.log('Using existing Polar customer');

      return existingCustomer;
    }
  } catch (error) {
    console.log('No existing Polar customer found by external ID, will create new one');
  }

  try {
    console.log('Creating new Polar customer');

    const newCustomer = await polarClient.customers.create({
      externalId: externalUserId,
      email: externalUserEmail,
    });

    return newCustomer;
  } catch (error) {
    console.error('Error creating Polar customer:', error);

    throw error;
  }
}
