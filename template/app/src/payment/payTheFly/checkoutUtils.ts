import { ethers } from 'ethers';
import { requireNodeEnvVar } from '../../server/utils';
import type { PaymentPlan } from '../plans';

// ----- EIP-712 Domain & Types -----

const EIP712_DOMAIN_NAME = 'PayTheFlyPro';
const EIP712_DOMAIN_VERSION = '1';

const PAYMENT_REQUEST_TYPES = {
  PaymentRequest: [
    { name: 'projectId', type: 'string' },
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'serialNo', type: 'string' },
    { name: 'deadline', type: 'uint256' },
  ],
};

// ----- Chain Configuration -----

export interface ChainConfig {
  chainId: number;
  decimals: number;
  nativeToken: string; // address(0) for native token
  verifyingContract: string;
}

/**
 * Supported chains for PayTheFly payments.
 * BSC (BNB Chain) uses 18 decimals; TRON uses 6 decimals.
 */
export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  BSC: {
    chainId: 56,
    decimals: 18,
    nativeToken: '0x0000000000000000000000000000000000000000',
    verifyingContract: '', // Set via env var
  },
  TRON: {
    chainId: 728126428,
    decimals: 6,
    nativeToken: '0x0000000000000000000000000000000000000000',
    verifyingContract: '', // Set via env var
  },
};

function getChainConfig(): ChainConfig {
  const chainId = parseInt(requireNodeEnvVar('PAYTHEFLY_CHAIN_ID'), 10);
  const verifyingContract = requireNodeEnvVar('PAYTHEFLY_VERIFYING_CONTRACT');

  const chain = Object.values(SUPPORTED_CHAINS).find(
    (c) => c.chainId === chainId,
  );
  if (!chain) {
    throw new Error(
      `Unsupported PayTheFly chain ID: ${chainId}. Supported: ${Object.entries(SUPPORTED_CHAINS)
        .map(([name, c]) => `${name}(${c.chainId})`)
        .join(', ')}`,
    );
  }

  return {
    ...chain,
    verifyingContract,
  };
}

// ----- Checkout URL Generation -----

/**
 * Price map for PayTheFly plans.
 * Prices are in the native token of the configured chain.
 * These are read from environment variables so you can configure
 * different prices per chain / token.
 */
function getPlanPrice(paymentPlan: PaymentPlan): string {
  // The plan's payment processor plan ID doubles as the env var key for the price.
  // e.g., PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID might be set to "hobby_monthly"
  // and PAYTHEFLY_PRICE_hobby_monthly=0.05
  const planId = paymentPlan.getPaymentProcessorPlanId();
  const priceEnvVar = `PAYTHEFLY_PRICE_${planId}`;
  return requireNodeEnvVar(priceEnvVar);
}

interface CreatePayTheFlyCheckoutUrlArgs {
  userId: string;
  userEmail: string;
  paymentPlan: PaymentPlan;
}

/**
 * Generates a PayTheFly payment link with an EIP-712 signature.
 *
 * The payment link redirects the user to PayTheFly's hosted payment page
 * where they connect their wallet and confirm the on-chain transaction.
 *
 * Flow:
 * 1. Generate a unique serial number (order ID)
 * 2. Sign the payment request with EIP-712 typed data
 * 3. Construct the payment URL with all parameters
 * 4. User pays on-chain → PayTheFly sends webhook → we update the user
 */
export async function createPayTheFlyCheckoutUrl({
  userId,
  userEmail,
  paymentPlan,
}: CreatePayTheFlyCheckoutUrlArgs): Promise<string> {
  const chain = getChainConfig();
  const projectId = requireNodeEnvVar('PAYTHEFLY_PROJECT_ID');
  const signerPrivateKey = requireNodeEnvVar('PAYTHEFLY_SIGNER_PRIVATE_KEY');
  const tokenAddress =
    process.env.PAYTHEFLY_TOKEN_ADDRESS || chain.nativeToken;

  const price = getPlanPrice(paymentPlan);
  const amount = ethers.parseUnits(price, chain.decimals);

  // Generate a unique serial number: USER_ID + timestamp + random suffix
  const serialNo = `${userId.slice(0, 8)}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Deadline: 30 minutes from now
  const deadline = Math.floor(Date.now() / 1000) + 30 * 60;

  // ----- EIP-712 Signing -----
  const domain = {
    name: EIP712_DOMAIN_NAME,
    version: EIP712_DOMAIN_VERSION,
    chainId: chain.chainId,
    verifyingContract: chain.verifyingContract,
  };

  const message = {
    projectId,
    token: tokenAddress,
    amount,
    serialNo,
    deadline,
  };

  const wallet = new ethers.Wallet(signerPrivateKey);
  const signature = await wallet.signTypedData(
    domain,
    PAYMENT_REQUEST_TYPES,
    message,
  );

  // ----- Construct Payment URL -----
  const params = new URLSearchParams({
    chainId: chain.chainId.toString(),
    projectId,
    amount: price,
    serialNo,
    deadline: deadline.toString(),
    signature,
    token: tokenAddress,
  });

  // Store the serial number → userId mapping for webhook reconciliation.
  // This is done via a custom metadata field in the serial number itself.
  // The serialNo format encodes the userId prefix for fast lookup.

  return `https://pro.paythefly.com/pay?${params.toString()}`;
}

/**
 * Extracts the userId prefix from a PayTheFly serial number.
 * Serial number format: `{userId_prefix}_{timestamp}_{random}`
 */
export function extractUserIdPrefixFromSerialNo(serialNo: string): string {
  const parts = serialNo.split('_');
  if (parts.length < 3) {
    throw new Error(`Invalid PayTheFly serial number format: ${serialNo}`);
  }
  return parts[0];
}
