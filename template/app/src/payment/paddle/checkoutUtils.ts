import { paddle } from './paddleClient';
import { requireNodeEnvVar } from '../../server/utils';
import { prisma } from 'wasp/server';
import { Customer } from '@paddle/paddle-node-sdk';

export interface CreatePaddleCheckoutSessionArgs {
  priceId: string;
  customerEmail: string;
  userId: string;
}

export async function createPaddleCheckoutSession({
  priceId,
  customerEmail,
  userId,
}: CreatePaddleCheckoutSessionArgs) {
  const baseCheckoutUrl = requireNodeEnvVar('PADDLE_HOSTED_CHECKOUT_URL');
  let customer: Customer;

  const customerCollection = paddle.customers.list({
    email: [customerEmail],
  });

  const customers = await customerCollection.next();

  if (!customers) {
    customer = await paddle.customers.create({
      email: customerEmail,
    });

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        paymentProcessorUserId: customer.id,
      },
    });
  } else {
    customer = customers[0];
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        paymentProcessorUserId: customer.id,
      },
    });
  }

  if (!customer) throw new Error('Could not create customer');

  const transaction = await paddle.transactions.create({
    items: [{ priceId, quantity: 1 }],
    customData: {
      userId,
    },
    customerId: customer.id,
  });

  const params = new URLSearchParams({
    price_id: priceId,
    transaction_id: transaction.id,
  });

  const checkoutUrl = `${baseCheckoutUrl}?${params.toString()}`;

  return {
    id: `paddle_checkout_${Date.now()}`,
    url: checkoutUrl,
  };
}
