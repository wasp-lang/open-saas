import { type File } from "wasp/entities";
import { HttpError } from "wasp/server";
import { type GetAllFilesByUser } from "wasp/server/operations";

const getAllFilesByUser: GetAllFilesByUser<void, File[]> = async (
  _args,
  context,
) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return context.entities.File.findMany({
    where: {
      user: {
        id: context.user.id,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export default getAllFilesByUser;
