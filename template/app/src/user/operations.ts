import * as z from 'zod';
import { type UpdateIsUserAdminById, type GetPaginatedUsers } from 'wasp/server/operations';
import { type User } from 'wasp/entities';
import { HttpError } from 'wasp/server';
import { subscriptionStatusSchema, type SubscriptionStatus } from '../payment/plans';
import { ensureArgsSchemaOrThrowHttpError } from '../server/validation';

const updateUserAdminByIdInputSchema = z.object({
  id: z.string().nonempty(),
  data: z.object({
    isAdmin: z.boolean(),
  }),
});

type UpdateUserAdminByIdInput = z.infer<typeof updateUserAdminByIdInputSchema>;

export const updateIsUserAdminById: UpdateIsUserAdminById<UpdateUserAdminByIdInput, User> = async (
  rawArgs,
  context
) => {
  const { id, data } = ensureArgsSchemaOrThrowHttpError(updateUserAdminByIdInputSchema, rawArgs);

  if (!context.user) {
    throw new HttpError(401);
  }

  if (!context.user.isAdmin) {
    throw new HttpError(403);
  }

  const updatedUser = await context.entities.User.update({
    where: {
      id: id,
    },
    data: {
      isAdmin: data.isAdmin,
    },
  });

  return updatedUser;
};

type GetPaginatedUsersOutput = {
  users: Pick<User, 'id' | 'email' | 'username' | 'subscriptionStatus' | 'paymentProcessorUserId'>[];
  totalPages: number;
};

const getPaginatorArgsSchema = z.object({
  skip: z.number(),
  cursor: z.number().optional(),
  emailContains: z.string().nonempty().optional(),
  isAdmin: z.boolean().optional(),
  subscriptionStatus: z.array(subscriptionStatusSchema).optional(),
});

type GetPaginatedUsersInput = z.infer<typeof getPaginatorArgsSchema>;

export const getPaginatedUsers: GetPaginatedUsers<GetPaginatedUsersInput, GetPaginatedUsersOutput> = async (
  rawArgs,
  context
) => {
  const { skip, cursor, emailContains, isAdmin, subscriptionStatus } = ensureArgsSchemaOrThrowHttpError(
    getPaginatorArgsSchema,
    rawArgs
  );

  if (!context.user?.isAdmin) {
    throw new HttpError(401);
  }

  const allSubscriptionStatusOptions = subscriptionStatus;
  const hasNotSubscribed = allSubscriptionStatusOptions?.find((status) => status === null);
  let subscriptionStatusStrings = allSubscriptionStatusOptions?.filter((status) => status !== null) as
    | string[]
    | undefined;

  const queryResults = await context.entities.User.findMany({
    skip,
    take: 10,
    where: {
      AND: [
        {
          email: {
            contains: emailContains || undefined,
            mode: 'insensitive',
          },
          isAdmin,
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
            contains: emailContains || undefined,
            mode: 'insensitive',
          },
          isAdmin,
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
