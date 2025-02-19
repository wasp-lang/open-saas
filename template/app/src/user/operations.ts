import {
  type UpdateCurrentUserLastActiveTimestamp,
  type UpdateIsUserAdminById,
  type GetPaginatedUsers,
} from 'wasp/server/operations';
import { type User } from 'wasp/entities';
import { HttpError } from 'wasp/server';
import { type SubscriptionStatus } from '../payment/plans';

export const updateIsUserAdminById: UpdateIsUserAdminById<Pick<User, 'id' | 'isAdmin'>, User> = async (
  { id, isAdmin },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'Only authenticated users are allowed to perform this operation');
  }

  if (!context.user.isAdmin) {
    throw new HttpError(403, 'Only admins are allowed to perform this operation');
  }

  return context.entities.User.update({
    where: { id },
    data: { isAdmin },
  });
};

export const updateCurrentUserLastActiveTimestamp: UpdateCurrentUserLastActiveTimestamp<
  Pick<User, 'lastActiveTimestamp'>,
  User
> = async ({ lastActiveTimestamp }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  return context.entities.User.update({
    where: {
      id: context.user.id,
    },
    data: { lastActiveTimestamp },
  });
};

type GetPaginatedUsersInput = {
  skip: number;
  cursor?: number | undefined;
  emailContains?: string;
  isAdmin?: boolean;
  subscriptionStatus?: SubscriptionStatus[];
};
type GetPaginatedUsersOutput = {
  users: Pick<
    User,
    | 'id'
    | 'email'
    | 'username'
    | 'lastActiveTimestamp'
    | 'subscriptionStatus'
    | 'paymentProcessorUserId'
    | 'isAdmin'
  >[];
  totalPages: number;
};

type GetPaginatedUsersOutput2 = {
  users: Array<{
    id: User['id'];
    email: User['email'];
    username: User['username'];
    lastActiveTimestamp: User['lastActiveTimestamp'];
    subscriptionStatus: User['subscriptionStatus'];
    paymentProcessorUserId: User['paymentProcessorUserId'];
  }>;
  totalPages: number;
};

export const getPaginatedUsers: GetPaginatedUsers<GetPaginatedUsersInput, GetPaginatedUsersOutput> = async (
  args,
  context
) => {
  if (!context.user?.isAdmin) {
    throw new HttpError(401);
  }

  const allSubscriptionStatusOptions = args.subscriptionStatus as Array<string | null> | undefined;
  const hasNotSubscribed = allSubscriptionStatusOptions?.find((status) => status === null);
  const subscriptionStatusStrings = allSubscriptionStatusOptions?.filter((status) => status !== null) as
    | string[]
    | undefined;

  const queryResults = await context.entities.User.findMany({
    skip: args.skip,
    take: 10,
    where: {
      AND: [
        {
          email: {
            contains: args.emailContains || undefined,
            mode: 'insensitive',
          },
          isAdmin: args.isAdmin,
        },
        {
          OR: [
            {
              subscriptionStatus: {
                in: subscriptionStatusStrings,
              },
            },
            {
              subscriptionStatus: {
                equals: hasNotSubscribed,
              },
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      email: true,
      username: true,
      isAdmin: true,
      lastActiveTimestamp: true,
      subscriptionStatus: true,
      paymentProcessorUserId: true,
    },
    orderBy: {
      id: 'desc',
    },
  });

  const totalUserCount = await context.entities.User.count({
    where: {
      AND: [
        {
          email: {
            contains: args.emailContains || undefined,
            mode: 'insensitive',
          },
          isAdmin: args.isAdmin,
        },
        {
          OR: [
            {
              subscriptionStatus: {
                in: subscriptionStatusStrings,
              },
            },
            {
              subscriptionStatus: {
                equals: hasNotSubscribed,
              },
            },
          ],
        },
      ],
    },
  });
  const totalPages = Math.ceil(totalUserCount / 10);

  return {
    users: queryResults,
    totalPages,
  };
};
