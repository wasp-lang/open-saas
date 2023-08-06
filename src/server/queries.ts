import HttpError from '@wasp/core/HttpError.js';
import type { RelatedObject } from '@wasp/entities';
import type { GetRelatedObjects } from '@wasp/queries/types';

export const getRelatedObjects: GetRelatedObjects<void, RelatedObject[]> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return context.entities.RelatedObject.findMany({
    where: {
      user: {
        id: context.user.id
      }
    },
  })
}