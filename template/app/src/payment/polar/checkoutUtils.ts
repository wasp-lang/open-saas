import { env } from 'wasp/server';
import type { PolarMode } from './paymentProcessor';
import { polar } from './polarClient';
// @ts-ignore
import { Customer } from '@polar-sh/sdk/models/components/customer.js';

export interface CreatePolarCheckoutSessionArgs {
  productId: string;
  userEmail: string;
  userId: string;
  mode: PolarMode;
}

export interface PolarCheckoutSession {
  id: string;
  url: string;
  customerId?: string;
}

export async function createPolarCheckoutSession({
  productId,
  userEmail,
  userId,
  mode,
}: CreatePolarCheckoutSessionArgs): Promise<PolarCheckoutSession> {
  const baseUrl = env.WASP_WEB_CLIENT_URL;

  const checkoutSessionArgs = {
    products: [productId], // Array of Polar Product IDs
    externalCustomerId: userId, // Use userId for customer deduplication
    customerBillingAddress: {
      country: 'US', // Default country - could be enhanced with user's actual country
    },
    successUrl: `${baseUrl}/checkout?success=true`,
    cancelUrl: `${baseUrl}/checkout?canceled=true`,
    metadata: {
      userId: userId,
      userEmail: userEmail,
      paymentMode: mode,
      source: 'OpenSaaS',
    },
  };
  const checkoutSession = await polar.checkouts.create(checkoutSessionArgs);

  if (!checkoutSession.url) {
    throw new Error('Polar checkout session created without URL');
  }

  const customerId = checkoutSession.customerId;

  return {
    id: checkoutSession.id,
    url: checkoutSession.url,
    customerId: customerId || undefined,
  };
}

export async function fetchPolarCustomer(email: string): Promise<Customer> {
  const customersIterator = await polar.customers.list({
    email: email,
    limit: 1,
  });

  for await (const page of customersIterator) {
    const customers = page.result?.items || [];

    if (customers.length > 0) {
      return customers[0];
    }

    break;
  }

  const newCustomer = await polar.customers.create({
    email: email,
  });

  return newCustomer;
}
