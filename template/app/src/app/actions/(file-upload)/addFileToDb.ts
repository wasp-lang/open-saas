import { type File } from "wasp/entities";
import { HttpError } from "wasp/server";
import { type AddFileToDb } from "wasp/server/operations";
import * as z from "zod";
import { checkFileExistsInS3 } from "../../../file-upload/s3Utils";
import { ALLOWED_FILE_TYPES } from "../../../file-upload/validation";
import { ensureArgsSchemaOrThrowHttpError } from "../../../server/validation";

const addFileToDbInputSchema = z.object({
  s3Key: z.string(),
  fileType: z.enum(ALLOWED_FILE_TYPES),
  fileName: z.string(),
});

type AddFileToDbInput = z.infer<typeof addFileToDbInputSchema>;

const addFileToDb: AddFileToDb<AddFileToDbInput, File> = async (
  rawArgs,
  context,
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const args = ensureArgsSchemaOrThrowHttpError(
    addFileToDbInputSchema,
    rawArgs,
  );

  const fileExists = await checkFileExistsInS3({ s3Key: args.s3Key });
  if (!fileExists) {
    throw new HttpError(404, "File not found in S3.");
  }

  return context.entities.File.create({
    data: {
      name: args.fileName,
      s3Key: args.s3Key,
      type: args.fileType,
      user: { connect: { id: context.user.id } },
    },
  });
};

export default addFileToDb;
