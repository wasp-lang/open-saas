import { type File } from 'wasp/entities';
import { HttpError } from 'wasp/server';
import {
  type CreateFile,
  type GetAllFilesByUser,
  type GetDownloadFileSignedURL,
} from 'wasp/server/operations';
import * as z from 'zod';

import { ensureArgsSchemaOrThrowHttpError } from '../server/validation';
import { getDownloadFileSignedURLFromS3, getUploadFileSignedURLFromS3 } from './s3Utils';
import { ALLOWED_FILE_TYPES } from './validation';

const createFileInputSchema = z.object({
  fileType: z.enum(ALLOWED_FILE_TYPES),
  fileName: z.string().nonempty(),
});

type CreateFileInput = z.infer<typeof createFileInputSchema>;

export const createFile: CreateFile<
  CreateFileInput,
  {
    s3UploadUrl: string;
    s3UploadFields: Record<string, string>;
  }
> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { fileType, fileName } = ensureArgsSchemaOrThrowHttpError(createFileInputSchema, rawArgs);

  const { s3UploadUrl, s3UploadFields, key } = await getUploadFileSignedURLFromS3({
    fileType,
    fileName,
    userId: context.user.id,
  });

  const numberOfFilesByUser = await context.entities.File.count({
    where: {
      user: {
        id: context.user.id,
      },
    },
  });

  if (numberOfFilesByUser >= 2) {
    throw new HttpError(403, 'Thanks for trying Open SaaS. This demo only allows 2 file uploads per user.');
  }

  await context.entities.File.create({
    data: {
      name: fileName,
      key,
      uploadUrl: s3UploadUrl,
      type: fileType,
      user: { connect: { id: context.user.id } },
    },
  });

  return {
    s3UploadUrl,
    s3UploadFields,
  };
};

export const getAllFilesByUser: GetAllFilesByUser<void, File[]> = async (_args, context) => {
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
      createdAt: 'desc',
    },
  });
};

const getDownloadFileSignedURLInputSchema = z.object({ key: z.string().nonempty() });

type GetDownloadFileSignedURLInput = z.infer<typeof getDownloadFileSignedURLInputSchema>;

export const getDownloadFileSignedURL: GetDownloadFileSignedURL<
  GetDownloadFileSignedURLInput,
  string
> = async (rawArgs, _context) => {
  const { key } = ensureArgsSchemaOrThrowHttpError(getDownloadFileSignedURLInputSchema, rawArgs);
  return await getDownloadFileSignedURLFromS3({ key });
};
