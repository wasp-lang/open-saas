import { faker } from "@faker-js/faker";
import type { PrismaClient } from "@prisma/client";
import { type User } from "wasp/entities";
import {
  getSubscriptionPaymentPlanIds,
  SubscriptionStatus,
} from "../../payment/plans";

type MockUserData = Omit<User, "id">;

const assetClasses = [
  "multifamily",
  "office",
  "industrial",
  "retail",
  "hotel",
  "mixed-use",
] as const;

/**
 * Seeds mock users and — for a subset — a couple of demo deals each so
 * admins can see populated dashboards right after `wasp db seed`.
 */
export async function seedMockUsers(prismaClient: PrismaClient) {
  const createdUsers = await Promise.all(
    generateMockUsersData(50).map((data) =>
      prismaClient.user.create({ data }),
    ),
  );

  // Give the first 10 seeded users a couple of demo deals each.
  const usersWithDeals = createdUsers.slice(0, 10);
  await Promise.all(
    usersWithDeals.flatMap((user) =>
      generateMockDeals(2).map((deal) =>
        prismaClient.deal.create({
          data: { ...deal, userId: user.id },
        }),
      ),
    ),
  );
}

function generateMockDeals(count: number) {
  return Array.from({ length: count }, () => {
    const assetClass = faker.helpers.arrayElement(assetClasses);
    const units =
      assetClass === "multifamily" || assetClass === "hotel"
        ? faker.number.int({ min: 40, max: 300 })
        : null;
    const squareFeet =
      assetClass === "multifamily" || assetClass === "hotel"
        ? null
        : faker.number.int({ min: 20_000, max: 400_000 });
    const purchasePrice = faker.number.int({
      min: 3_000_000,
      max: 120_000_000,
    });
    return {
      name: `${faker.location.streetAddress({ useFullAddress: false })} — ${
        faker.company.name().split(" ")[0]
      } ${assetClass}`,
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      assetClass,
      units,
      squareFeet,
      yearBuilt: faker.number.int({ min: 1960, max: 2022 }),
      purchasePrice,
      notes: faker.lorem.sentence(),
    };
  });
}

function generateMockUsersData(numOfUsers: number): MockUserData[] {
  return faker.helpers.multiple(generateMockUserData, { count: numOfUsers });
}

function generateMockUserData(): MockUserData {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const subscriptionStatus =
    faker.helpers.arrayElement<SubscriptionStatus | null>([
      ...Object.values(SubscriptionStatus),
      null,
    ]);
  const now = new Date();
  const createdAt = faker.date.past({ refDate: now });
  const timePaid = faker.date.between({ from: createdAt, to: now });
  const credits = subscriptionStatus
    ? 0
    : faker.number.int({ min: 0, max: 10 });
  const hasUserPaidOnStripe = !!subscriptionStatus || credits > 3;
  return {
    email: faker.internet.email({ firstName, lastName }),
    username: faker.internet.userName({ firstName, lastName }),
    createdAt,
    isAdmin: false,
    credits,
    subscriptionStatus,
    lemonSqueezyCustomerPortalUrl: null,
    paymentProcessorUserId: hasUserPaidOnStripe
      ? `cus_test_${faker.string.uuid()}`
      : null,
    datePaid: hasUserPaidOnStripe
      ? faker.date.between({ from: createdAt, to: timePaid })
      : null,
    subscriptionPlan: subscriptionStatus
      ? faker.helpers.arrayElement(getSubscriptionPaymentPlanIds())
      : null,
  };
}
