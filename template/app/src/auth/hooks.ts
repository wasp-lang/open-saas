import { HttpError } from 'wasp/server';
import type { OnAfterSignupHook } from 'wasp/server/auth';

export const onAfterSignup: OnAfterSignupHook = async ({ providerId, user, prisma }) => {
  // For Stripe to function correctly, we need a valid email associated with the user.
  // Discord allows an email address to be optional. If this is the case, we delete the user
  // from our DB and throw an error.
  if (providerId.providerName === 'discord' && !user.email) {
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
    throw new HttpError(403, 'Discord user needs a valid email to sign up');
  }
};
