import { type Task } from "wasp/entities";
import { HttpError } from "wasp/server";
import { type GetAllTasksByUser } from "wasp/server/operations";

const getAllTasksByUser: GetAllTasksByUser<void, Task[]> = async (
  _args,
  context,
) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return context.entities.Task.findMany({
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

export default getAllTasksByUser;
