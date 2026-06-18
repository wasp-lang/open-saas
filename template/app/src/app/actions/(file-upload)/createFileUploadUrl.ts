import { HttpError } from "wasp/server";
import { type CreateFileUploadUrl } from "wasp/server/operations";
import * as z from "zod";
import { getUploadFileSignedURLFromS3 } from "../../../file-upload/s3Utils";
import { ALLOWED_FILE_TYPES } from "../../../file-upload/validation";
import { ensureArgsSchemaOrThrowHttpError } from "../../../server/validation";

const createFileInputSchema = z.object({
  fileType: z.enum(ALLOWED_FILE_TYPES),
  fileName: z.string().nonempty(),
});

type CreateFileInput = z.infer<typeof createFileInputSchema>;

const createFileUploadUrl: CreateFileUploadUrl<
  CreateFileInput,
  {
    s3UploadUrl: string;
    s3UploadFields: Record<string, string>;
    s3Key: string;
  }
> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { fileType, fileName } = ensureArgsSchemaOrThrowHttpError(
    createFileInputSchema,
    rawArgs,
  );

  return await getUploadFileSignedURLFromS3({
    fileType,
    fileName,
    userId: context.user.id,
  });
};

export default createFileUploadUrl;
