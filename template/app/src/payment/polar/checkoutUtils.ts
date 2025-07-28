import { requireNodeEnvVar } from '../../server/utils';
import type { PolarMode } from './paymentProcessor';
import { polar } from './polarClient';

/**
 * Arguments for creating a Polar checkout session
 */
export interface CreatePolarCheckoutSessionArgs {
  productId: string;
  userEmail: string;
  userId: string;
  mode: PolarMode;
}

/**
 * Represents a Polar checkout session
 */
export interface PolarCheckoutSession {
  id: string;
  url: string;
  customerId?: string;
}

/**
 * Creates a Polar checkout session
 * @param args Arguments for creating a Polar checkout session
 * @param args.productId Product/price ID to use for the checkout session
 * @param args.userEmail Email address of the customer
 * @param args.userId Internal user ID for tracking
 * @param args.mode Mode of the checkout session (subscription or payment)
 * @returns Promise resolving to a PolarCheckoutSession object
 */
export async function createPolarCheckoutSession({
  productId,
  userEmail,
  userId,
  mode,
}: CreatePolarCheckoutSessionArgs): Promise<PolarCheckoutSession> {
  try {
    // TODO: Verify exact API structure with Polar SDK documentation
    const checkoutSession = await polar.checkouts.create({
      // TODO: Verify correct property name for product/price ID
      productPriceId: productId,
      successUrl: `${requireNodeEnvVar('WASP_WEB_CLIENT_URL')}/checkout/success`,
      customerEmail: userEmail,
      metadata: {
        userId: userId,
        mode: mode,
      },
      allowDiscountCodes: true,
      requireBillingAddress: false,
    } as any); // TODO: Replace temporary type assertion once API is verified

    if (!checkoutSession.url) {
      throw new Error('Polar checkout session created without URL');
    }

    return {
      id: checkoutSession.id,
      url: checkoutSession.url,
      customerId: checkoutSession.customerId || undefined,
    };
  } catch (error) {
    console.error('Error creating Polar checkout session:', error);
    throw new Error(`Failed to create Polar checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetches or creates a Polar customer
 * @param email Email address of the customer
 * @returns Promise resolving to a PolarCustomer object
 */
export async function fetchPolarCustomer(email: string) {
  try {
    // TODO: Verify exact customer lookup and creation API with Polar SDK documentation
    // Try to find existing customer by email
    const customersIterator = await polar.customers.list({
      email: email,
      limit: 1,
    } as any); // Temporary type assertion until API is verified

    // TODO: Verify how to properly iterate through PageIterator results
    let existingCustomer = null;
    for await (const page of customersIterator as any) {
      if ((page as any).items && (page as any).items.length > 0) {
        existingCustomer = (page as any).items[0];
        break;
      }
    }

    if (existingCustomer) {
      return existingCustomer;
    }

    // If no customer found, create a new one
    const newCustomer = await polar.customers.create({
      email: email,
    } as any); // Temporary type assertion until API is verified

    return newCustomer;
  } catch (error) {
    console.error('Error fetching/creating Polar customer:', error);
    throw new Error(`Failed to fetch/create Polar customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 