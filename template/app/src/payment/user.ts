import { User } from "wasp/entities";
import { PrismaClient } from "wasp/server";

export async function fetchUserPaymentProcessorUserId(
  userId: User["id"],
  prismaUserDelegate: PrismaClient["user"],
): Promise<string | null> {
  const user = await prismaUserDelegate.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select: {
      paymentProcessorUserId: true,
    },
  });

  return user.paymentProcessorUserId;
}

interface UpdateUserPaymentProcessorUserIdArgs {
  userId: User["id"];
  paymentProcessorUserId: NonNullable<User["paymentProcessorUserId"]>;
}

export function updateUserPaymentProcessorUserId(
  { userId, paymentProcessorUserId }: UpdateUserPaymentProcessorUserIdArgs,
  prismaUserDelegate: PrismaClient["user"],
): Promise<User> {
  return prismaUserDelegate.update({
    where: {
      id: userId,
    },
    data: {
      paymentProcessorUserId,
    },
  });
}

interface RecordUserPaymentArgs {
  paymentProcessorUserId: NonNullable<User["paymentProcessorUserId"]>;
  datePaid: Date;
  // `0` for subscription payments.
  numOfCreditsPurchased: number;
}

/**
 * Sets the date of the user's last payment and adds the credits they bought
 * (if not a subscription payment).
 */
export function recordUserPayment(
  {
    paymentProcessorUserId,
    datePaid,
    numOfCreditsPurchased,
  }: RecordUserPaymentArgs,
  userDelegate: PrismaClient["user"],
): Promise<User> {
  return userDelegate.update({
    where: {
      paymentProcessorUserId,
    },
    data: {
      credits: { increment: numOfCreditsPurchased },
      datePaid,
    },
  });
}
