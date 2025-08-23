// @ts-ignore
import { CheckoutCreate } from '@polar-sh/sdk/models/components/checkoutcreate.js';
// @ts-ignore
import { Customer } from '@polar-sh/sdk/models/components/customer.js';
import { env } from 'wasp/server';
import type { PolarMode } from './paymentProcessor';
import { polarClient } from './polarClient';

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
  const baseUrl = env.WASP_WEB_CLIENT_URL.replace(/\/+$/, '');
  const successUrl = `${baseUrl}/checkout?success=true`;
  const existingCustomer = await fetchPolarCustomer(userId, userEmail);
  const checkoutSessionArgs: CheckoutCreate = {
    products: [productId],
    externalCustomerId: userId,
    customerEmail: userEmail,
    successUrl: successUrl,
    metadata: {
      paymentMode: mode,
      source: baseUrl,
    },
    ...(existingCustomer && { customerId: existingCustomer.id }),
  };
  const checkoutSession = await polarClient.checkouts.create(checkoutSessionArgs);
  const customerId = checkoutSession.customerId;

  return {
    id: checkoutSession.id,
    url: checkoutSession.url,
    customerId: customerId || undefined,
  };
}

export async function fetchPolarCustomer(waspUserId: string, customerEmail: string): Promise<Customer> {
  try {
    const existingCustomer = await polarClient.customers.getExternal({
      externalId: waspUserId,
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
      externalId: waspUserId,
      email: customerEmail,
    });

    return newCustomer;
  } catch (error) {
    console.error('Error creating Polar customer:', error);

    throw error;
  }
}
