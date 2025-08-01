import { env } from 'wasp/server';
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
 * @param args.productId Polar Product ID to use for the checkout session
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
    const baseUrl = env.WASP_WEB_CLIENT_URL;

    // Create checkout session with proper Polar API structure
    // Using type assertion due to potential API/TypeScript definition mismatches
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
    const checkoutSession = await polar.checkouts.create(checkoutSessionArgs as any);

    if (!checkoutSession.url) {
      throw new Error('Polar checkout session created without URL');
    }

    // Return customer ID from checkout session if available
    const customerId = (checkoutSession as any).customer_id || (checkoutSession as any).customerId;

    return {
      id: checkoutSession.id,
      url: checkoutSession.url,
      customerId: customerId || undefined,
    };
  } catch (error) {
    console.error('Error creating Polar checkout session:', error);
    throw new Error(
      `Failed to create Polar checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Fetches or creates a Polar customer for a given email address
 * @param email Email address of the customer
 * @returns Promise resolving to a Polar customer object
 */
export async function fetchPolarCustomer(email: string) {
  try {
    const customersIterator = await polar.customers.list({
      email: email,
      limit: 1,
    });
    let existingCustomer = null;

    for await (const page of customersIterator as any) {
      const customers = (page as any).items || [];

      if (customers.length > 0) {
        existingCustomer = customers[0];

        break;
      }
    }

    if (existingCustomer) {
      return existingCustomer;
    }

    const newCustomer = await polar.customers.create({
      email: email,
    });

    return newCustomer;
  } catch (error) {
    console.error('Error fetching/creating Polar customer:', error);

    throw new Error(
      `Failed to fetch/create Polar customer: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
