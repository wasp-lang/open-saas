import { HttpError } from 'wasp/server';
import { type File } from 'wasp/entities';
import {
  type CreateFile,
  type GetAllFilesByUser,
  type GetDownloadFileSignedURL,
} from 'wasp/server/operations';

import {
  getUploadFileSignedURLFromS3,
  getDownloadFileSignedURLFromS3
} from './s3Utils';

type FileDescription = {
  fileType: string;
  name: string;
};

export const createFile: CreateFile<FileDescription, File> = async ({ fileType, name }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

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

  const userInfo = context.user.id;

  const { uploadUrl, key } = await getUploadFileSignedURLFromS3({ fileType, userInfo });

  return await context.entities.File.create({
    data: {
      name,
      key,
      uploadUrl,
      type: fileType,
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

export const getDownloadFileSignedURL: GetDownloadFileSignedURL<{ key: string }, string> = async (
  { key },
  _context
) => {
  return await getDownloadFileSignedURLFromS3({ key });
};
