import { type User } from 'wasp/entities';
import { faker } from '@faker-js/faker';
import type { PrismaClient } from '@prisma/client';
import { TierIds } from '../../shared/constants.js';

/**
 * This function, which we've imported in `app.db.seeds` in the `main.wasp` file, 
 * seeds the database with mock users via the `wasp db seed` command.
 * For more info see: https://wasp-lang.dev/docs/data-model/backends#seeding-the-database
 */
export async function seedMockUsersToDB(prismaClient: PrismaClient) {
  const mockUsers: Omit<User, 'id'>[] = getMockUsers(50);
  const persistUsersToDB = mockUsers.map((user) => {
    return prismaClient.user.create({
      data: user,
    });
  });

  try {
    await Promise.all(persistUsersToDB);
  } catch (error) {
    console.error(error);
  }
}

function getMockUsers(numOfUsers: number): Omit<User, 'id'>[] {
  return faker.helpers.multiple(defineMockUser, {
    count: numOfUsers,
  });
}

function defineMockUser(): Omit<User, 'id'> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const user: Omit<User, 'id'> = {
    email: faker.internet.email({
      firstName,
      lastName,
    }),
    username: faker.internet.userName({
      firstName,
      lastName,
    }),
    createdAt: faker.date.between({ from: new Date('2023-01-01'), to: new Date() }),
    lastActiveTimestamp: faker.date.recent(),
    isAdmin: false,
    stripeId: `cus_${faker.string.uuid()}`,
    sendEmail: false,
    subscriptionStatus: faker.helpers.arrayElement(['active', 'canceled', 'past_due', 'deleted', null]),
    datePaid: faker.date.recent(),
    credits: faker.number.int({ min: 0, max: 3 }),
    checkoutSessionId: null,
    subscriptionTier: faker.helpers.arrayElement([TierIds.HOBBY, TierIds.PRO]),
  };
  return user;
};
