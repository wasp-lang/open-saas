import { type GetDownloadFileSignedUrl } from "wasp/server/operations";
import * as z from "zod";
import { getDownloadFileSignedURLFromS3 } from "../../../file-upload/s3Utils";
import { ensureArgsSchemaOrThrowHttpError } from "../../../server/validation";

const getDownloadFileSignedURLInputSchema = z.object({
  s3Key: z.string().nonempty(),
});

type GetDownloadFileSignedURLInput = z.infer<
  typeof getDownloadFileSignedURLInputSchema
>;

const getDownloadFileSignedURL: GetDownloadFileSignedUrl<
  GetDownloadFileSignedURLInput,
  string
> = async (rawArgs) => {
  const { s3Key } = ensureArgsSchemaOrThrowHttpError(
    getDownloadFileSignedURLInputSchema,
    rawArgs,
  );
  return await getDownloadFileSignedURLFromS3({ s3Key });
};

export default getDownloadFileSignedURL;
