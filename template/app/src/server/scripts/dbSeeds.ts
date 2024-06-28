import { type User } from 'wasp/entities';
import { faker } from '@faker-js/faker';
import type { PrismaClient } from '@prisma/client';
import { TierIds } from '../../shared/constants.js';

/**
 * This function, which we've imported in `app.db.seeds` in the `main.wasp` file,
 * seeds the database with mock users via the `wasp db seed` command.
 * For more info see: https://wasp-lang.dev/docs/data-model/backends#seeding-the-database
 */
export async function seedMockUsers(prismaClient: PrismaClient) {
  const createUser = (data: Omit<User, 'id'>) => prismaClient.user.create({ data });
  await Promise.all(generateMockUsersData(50).map(createUser));
}

function generateMockUsersData(numOfUsers: number) {
  return faker.helpers.multiple(generateMockUserData, { count: numOfUsers });
}

function generateMockUserData() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const now = new Date();
  const recently = faker.date.recent({ refDate: now }); // Creates a random date up to 24 hrs ago from refDate
  const past = faker.date.past({ refDate: now }); // Creates a random date in past up to 1 year from refDate
  const user = {
    email: faker.internet.email({ firstName, lastName }),
    username: faker.internet.userName({ firstName, lastName }),
    createdAt: past,
    lastActiveTimestamp: recently,
    isAdmin: false,
    stripeId: `cus_${faker.string.uuid()}`,
    sendEmail: false,
    subscriptionStatus: faker.helpers.arrayElement(['active', 'canceled', 'past_due', 'deleted', null]),
    datePaid: faker.date.between({ from: past, to: recently }),
    credits: faker.number.int({ min: 0, max: 3 }),
    checkoutSessionId: null,
    subscriptionTier: faker.helpers.arrayElement([TierIds.HOBBY, TierIds.PRO]),
  } satisfies Omit<User, 'id'>;
  return user;
}
