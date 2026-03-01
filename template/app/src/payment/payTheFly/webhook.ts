import crypto from 'crypto';
import express from 'express';
import { type PrismaClient } from '@prisma/client';
import { type MiddlewareConfigFn } from 'wasp/server';
import { type PaymentsWebhook } from 'wasp/server/api';
import { requireNodeEnvVar } from '../../server/utils';
import { assertUnreachable } from '../../shared/utils';
import { UnhandledWebhookEventError } from '../errors';
import {
  PaymentPlanId,
  paymentPlans,
  SubscriptionStatus,
} from '../plans';
import { updateUserCredits, updateUserSubscription } from '../user';

// ----- Webhook Payload Types -----

/**
 * PayTheFly webhook body format:
 * {
 *   "data": "<json string>",
 *   "sign": "<hmac hex>",
 *   "timestamp": <unix int>
 * }
 */
interface PayTheFlyWebhookBody {
  data: string;
  sign: string;
  timestamp: number;
}

/**
 * PayTheFly webhook data fields (parsed from the `data` JSON string).
 */
interface PayTheFlyWebhookData {
  project_id: string;
  chain_symbol: string;
  tx_hash: string;
  wallet: string;
  value: string;
  fee: string;
  serial_no: string;
  /** 1 = payment, 2 = withdrawal */
  tx_type: number;
  confirmed: boolean;
  create_at: string;
}

// ----- Middleware Configuration -----

/**
 * PayTheFly sends JSON in the request body.
 * We need the raw body for HMAC verification, so we use express.raw()
 * and parse it ourselves.
 */
export const payTheFlyMiddlewareConfigFn: MiddlewareConfigFn = (
  middlewareConfig,
) => {
  middlewareConfig.delete('express.json');
  middlewareConfig.set(
    'express.raw',
    express.raw({ type: 'application/json' }),
  );
  return middlewareConfig;
};

// ----- Webhook Handler -----

export const payTheFlyWebhook: PaymentsWebhook = async (
  request,
  response,
  context,
) => {
  const prismaUserDelegate = context.entities.User;

  try {
    const body = parseAndVerifyWebhook(request);
    const data: PayTheFlyWebhookData = JSON.parse(body.data);

    // Only process confirmed payment transactions
    if (data.tx_type === 1 && data.confirmed) {
      await handlePaymentConfirmed(data, prismaUserDelegate);
    } else if (data.tx_type === 2) {
      // Withdrawal events — log but don't process
      console.info(`PayTheFly withdrawal event: tx_hash=${data.tx_hash}`);
    } else if (data.tx_type === 1 && !data.confirmed) {
      // Unconfirmed payment — log and wait for confirmed webhook
      console.info(
        `PayTheFly unconfirmed payment: serial_no=${data.serial_no}, tx_hash=${data.tx_hash}`,
      );
    } else {
      throw new UnhandledWebhookEventError(`tx_type=${data.tx_type}`);
    }

    // PayTheFly requires the response to contain "success"
    return response.status(200).json({ status: 'success' });
  } catch (error) {
    if (error instanceof UnhandledWebhookEventError) {
      if (process.env.NODE_ENV === 'development') {
        console.info(
          'Unhandled PayTheFly webhook event in development: ',
          error,
        );
      } else if (process.env.NODE_ENV === 'production') {
        console.error(
          'Unhandled PayTheFly webhook event in production: ',
          error,
        );
      }
      // Still return "success" to prevent retries
      return response.status(200).json({ status: 'success' });
    }

    console.error('PayTheFly webhook error:', error);
    if (error instanceof Error) {
      return response.status(400).json({ error: error.message });
    } else {
      return response
        .status(500)
        .json({ error: 'Error processing PayTheFly webhook event' });
    }
  }
};

// ----- HMAC Verification -----

/**
 * Verifies the PayTheFly webhook signature using HMAC-SHA256.
 *
 * Sign algorithm: HMAC-SHA256(data + "." + timestamp, projectKey)
 */
function parseAndVerifyWebhook(
  request: express.Request,
): PayTheFlyWebhookBody {
  const rawBody = request.body.toString('utf8');
  const body: PayTheFlyWebhookBody = JSON.parse(rawBody);

  if (!body.data || !body.sign || !body.timestamp) {
    throw new Error(
      'Invalid PayTheFly webhook body: missing data, sign, or timestamp',
    );
  }

  const projectKey = requireNodeEnvVar('PAYTHEFLY_PROJECT_KEY');
  const payload = `${body.data}.${body.timestamp}`;
  const expectedSign = crypto
    .createHmac('sha256', projectKey)
    .update(payload)
    .digest('hex');

  if (
    !crypto.timingSafeEqual(
      Buffer.from(body.sign, 'utf8'),
      Buffer.from(expectedSign, 'utf8'),
    )
  ) {
    throw new Error('Invalid PayTheFly webhook signature');
  }

  // Optional: check timestamp freshness (reject events older than 5 minutes)
  const now = Math.floor(Date.now() / 1000);
  const MAX_AGE_SECONDS = 300;
  if (Math.abs(now - body.timestamp) > MAX_AGE_SECONDS) {
    throw new Error(
      `PayTheFly webhook timestamp too old: ${body.timestamp} (now: ${now})`,
    );
  }

  return body;
}

// ----- Payment Processing -----

/**
 * Handles a confirmed payment from PayTheFly.
 *
 * The serial_no encodes the userId prefix (first 8 chars) which we use
 * to find the user. We also look up which plan was purchased based on
 * the payment amount and configured plan prices.
 */
async function handlePaymentConfirmed(
  data: PayTheFlyWebhookData,
  prismaUserDelegate: PrismaClient['user'],
): Promise<void> {
  const { serial_no, value, wallet, tx_hash, chain_symbol } = data;

  // Extract userId prefix from serial_no (first 8 chars of UUID).
  // PayTheFly paymentProcessorUserId is set to the full userId,
  // so we find all users whose id starts with this prefix.
  const userIdPrefix = serial_no.split('_')[0];
  if (!userIdPrefix) {
    throw new Error(
      `Cannot extract userId from serial_no: ${serial_no}`,
    );
  }

  // For PayTheFly, paymentProcessorUserId === userId.
  // We search by id prefix since the serial_no only contains the first 8 chars.
  const users = await prismaUserDelegate.findMany({
    where: {
      id: {
        startsWith: userIdPrefix,
      },
      paymentProcessorUserId: {
        not: null,
      },
    },
  });

  if (users.length === 0) {
    throw new Error(
      `No user found for PayTheFly serial_no: ${serial_no} (prefix: ${userIdPrefix})`,
    );
  }

  if (users.length > 1) {
    console.warn(
      `PayTheFly: Multiple users match prefix ${userIdPrefix}. Using first match.`,
    );
  }

  const user = users[0];

  // Determine the payment plan based on the serial_no or amount
  const paymentPlanId = detectPaymentPlanFromSerialNo(serial_no, value);

  const datePaid = data.create_at ? new Date(data.create_at) : new Date();

  switch (paymentPlans[paymentPlanId].effect.kind) {
    case 'credits':
      await updateUserCredits(
        {
          paymentProcessorUserId: user.paymentProcessorUserId!,
          numOfCreditsPurchased: paymentPlans[paymentPlanId].effect.amount,
          datePaid,
        },
        prismaUserDelegate,
      );
      break;
    case 'subscription':
      await updateUserSubscription(
        {
          paymentProcessorUserId: user.paymentProcessorUserId!,
          paymentPlanId,
          subscriptionStatus: SubscriptionStatus.Active,
          datePaid,
        },
        prismaUserDelegate,
      );
      break;
    default:
      assertUnreachable(paymentPlans[paymentPlanId].effect.kind);
  }

  console.log(
    `PayTheFly payment confirmed: user=${user.id}, plan=${paymentPlanId}, ` +
      `amount=${value}, chain=${chain_symbol}, tx=${tx_hash}, wallet=${wallet}`,
  );
}

/**
 * Detects which payment plan was purchased by matching the serial_no pattern
 * or the payment amount against configured plan prices.
 *
 * Strategy:
 * 1. Try to match amount against each plan's configured price
 * 2. Fall back to the cheapest subscription plan if no exact match
 */
function detectPaymentPlanFromSerialNo(
  _serialNo: string,
  value: string,
): PaymentPlanId {
  // Try to match by configured price for each plan
  for (const planId of Object.values(PaymentPlanId)) {
    try {
      const planPriceEnvVar = `PAYTHEFLY_PRICE_${paymentPlans[planId].getPaymentProcessorPlanId()}`;
      const configuredPrice = process.env[planPriceEnvVar];
      if (configuredPrice && parseFloat(configuredPrice) === parseFloat(value)) {
        return planId;
      }
    } catch {
      // Plan ID env var not set — skip
      continue;
    }
  }

  // If no exact match, log a warning and default to Hobby plan
  console.warn(
    `PayTheFly: Could not match payment amount ${value} to any plan. Defaulting to Hobby.`,
  );
  return PaymentPlanId.Hobby;
}
