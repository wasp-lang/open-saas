import { type GptResponse } from "wasp/entities";
import { HttpError } from "wasp/server";
import { type GetGptResponses } from "wasp/server/operations";

const getGptResponses: GetGptResponses<void, GptResponse[]> = async (
  _args,
  context,
) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return context.entities.GptResponse.findMany({
    where: {
      user: {
        id: context.user.id,
      },
    },
  });
};

export default getGptResponses;
