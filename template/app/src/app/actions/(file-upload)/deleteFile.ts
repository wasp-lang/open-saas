import { type File } from "wasp/entities";
import { HttpError } from "wasp/server";
import { type DeleteFile } from "wasp/server/operations";
import * as z from "zod";
import { deleteFileFromS3 } from "../../../file-upload/s3Utils";
import { ensureArgsSchemaOrThrowHttpError } from "../../../server/validation";

const deleteFileInputSchema = z.object({
  id: z.string(),
});

type DeleteFileInput = z.infer<typeof deleteFileInputSchema>;

const deleteFile: DeleteFile<DeleteFileInput, File> = async (
  rawArgs,
  context,
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const args = ensureArgsSchemaOrThrowHttpError(deleteFileInputSchema, rawArgs);

  const deletedFile = await context.entities.File.delete({
    where: {
      id: args.id,
      user: {
        id: context.user.id,
      },
    },
  });

  try {
    await deleteFileFromS3({ s3Key: deletedFile.s3Key });
  } catch (error) {
    console.error(
      `S3 deletion failed. Orphaned file s3Key: ${deletedFile.s3Key}`,
      error,
    );
  }

  return deletedFile;
};

export default deleteFile;
