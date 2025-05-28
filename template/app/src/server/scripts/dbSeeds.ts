import { type User } from 'wasp/entities';
import { faker } from '@faker-js/faker';
import type { PrismaClient } from '@prisma/client';
import { getSubscriptionPaymentPlanIds, SubscriptionStatus } from '../../payment/plans';

type MockUserData = Omit<User, 'id'>;

/**
 * This function, which we've imported in `app.db.seeds` in the `main.wasp` file,
 * seeds the database with mock users via the `wasp db seed` command.
 * For more info see: https://wasp.sh/docs/data-model/backends#seeding-the-database
 */
export async function seedMockUsers(prismaClient: PrismaClient) {
  await Promise.all(generateMockUsersData(50).map((data) => prismaClient.user.create({ data })));
}

function generateMockUsersData(numOfUsers: number): MockUserData[] {
  return faker.helpers.multiple(generateMockUserData, { count: numOfUsers });
}

function generateMockUserData(): MockUserData {
  const mockUsers = [
    {
      email: faker.internet.email(),
      username: faker.internet.userName(),
      isEmailVerified: faker.datatype.boolean(),
      isAdmin: false,
      stripeId: `cus_${faker.string.alphanumeric(14)}`,
      checkoutSessionId: null,
      hasPaid: faker.datatype.boolean(),
      sendEmail: faker.datatype.boolean(),
      datePaid: faker.date.past(),
      credits: faker.number.int({ min: 0, max: 20 }),
      subscriptionStatus: faker.helpers.arrayElement(['active', 'inactive', 'canceled', null]),
      paymentProcessorUserId: `user_${faker.string.alphanumeric(10)}`,
      subscriptionPlan: faker.helpers.arrayElement(['hobby', 'pro', null]),
      lemonSqueezyCustomerPortalUrl: null,
      emailVerificationSentAt: faker.date.recent(),
      passwordResetSentAt: faker.date.recent(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    },
  ];
  return faker.helpers.arrayElement(mockUsers);
}