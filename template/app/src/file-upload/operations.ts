import * as z from 'zod';
import { HttpError } from 'wasp/server';
import { type File } from 'wasp/entities';
import {
  type GetAllFilesByUser,
  type GetDownloadFileSignedURL,
  type DeleteFile,
  type CreateFileUploadUrl,
  type AddFileToDb,
} from 'wasp/server/operations';

import {
  getUploadFileSignedURLFromS3,
  getDownloadFileSignedURLFromS3,
  deleteFileFromS3,
  checkFileExistsInS3,
} from './s3Utils';
import { ensureArgsSchemaOrThrowHttpError } from '../server/validation';
import { ALLOWED_FILE_TYPES } from './validation';

const createFileInputSchema = z.object({
  fileType: z.enum(ALLOWED_FILE_TYPES),
  fileName: z.string().nonempty(),
});

type CreateFileInput = z.infer<typeof createFileInputSchema>;

export const createFileUploadUrl: CreateFileUploadUrl<
  CreateFileInput,
  {
    s3UploadUrl: string;
    s3UploadFields: Record<string, string>;
    key: string;
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

  return {
    s3UploadUrl,
    s3UploadFields,
    key,
  };
};

const addFileToDbInputSchema = z.object({
  key: z.string(),
  fileType: z.enum(ALLOWED_FILE_TYPES),
  fileName: z.string(),
});

type AddFileToDbInput = z.infer<typeof addFileToDbInputSchema>;

export const addFileToDb: AddFileToDb<AddFileToDbInput, File> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const fileExists = await checkFileExistsInS3({ key: args.key });
  if (!fileExists) {
    throw new HttpError(404, 'File not found in S3.');
  }

  return context.entities.File.create({
    data: {
      name: args.fileName,
      key: args.key,
      type: args.fileType,
      user: { connect: { id: context.user.id } },
    },
  });
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

const deleteFileInputSchema = z.object({
  id: z.string(),
});

type DeleteFileInput = z.infer<typeof deleteFileInputSchema>;

export const deleteFile: DeleteFile<DeleteFileInput, File> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const deletedFile = await context.entities.File.delete({
    where: {
      id: args.id,
      user: {
        id: context.user.id,
      },
    },
  });

  try {
    await deleteFileFromS3({ key: deletedFile.key });
  } catch (error) {
    console.error(`S3 deletion failed. Orphaned file key: ${deletedFile.key}`, error);
  }

  return deletedFile;
};
