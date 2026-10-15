import type { PrismaClient } from "wasp/server";
import { parsePaymentPlanId, paymentPlans } from "../plans";
import { updateUserCredits } from "../user";
import type { MptIntentMetadata } from "./mptClient";

interface PaidMptIntent {
  sid: string | null;
  metadata?: MptIntentMetadata | null;
  paidAt: Date;
}

/**
 * Both the webhook and `confirmCheckoutSession` grant a purchase through this
 * function, under the same processed event id (`int_<sid>` or `late_<sid>`),
 * so a purchase is granted once even when both report it.
 */
export async function grantMptPurchase(
  { sid, metadata, paidAt }: PaidMptIntent,
  userDelegate: PrismaClient["user"],
): Promise<void> {
  const userId = metadata?.userId;
  if (!userId || !metadata?.paymentPlanId) {
    throw new Error(`MPT intent ${sid} has no Open SaaS metadata`);
  }
  const paymentPlanId = parsePaymentPlanId(metadata.paymentPlanId);
  const paymentPlan = paymentPlans[paymentPlanId];

  if (paymentPlan.effect.kind !== "credits") {
    throw new Error(
      `MPT intent ${sid} paid for a subscription plan, which MPT does not support`,
    );
  }

  await updateUserCredits(
    {
      paymentProcessorUserId: userId,
      numOfCreditsPurchased: paymentPlan.effect.amount,
      datePaid: paidAt,
    },
    userDelegate,
  );
}

export function getMptPurchaseEventId(
  sid: string,
  settlement: "paid" | "late",
): string {
  // The same ids MPT puts in the `webhook-id` header.
  return settlement === "paid" ? `int_${sid}` : `late_${sid}`;
}
