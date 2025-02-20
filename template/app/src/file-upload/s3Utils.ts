import * as path from 'path';
import { randomUUID } from 'crypto';
import { S3Client } from '@aws-sdk/client-s3';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_IAM_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_S3_IAM_SECRET_KEY!,
  },
});

type S3Upload = {
  fileType: string;
  fileName: string;
  userId: string;
};

export const getUploadFileSignedURLFromS3 = async ({ fileName, fileType, userId }: S3Upload) => {
  const key = getS3Key(fileName, userId);
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_FILES_BUCKET,
    Key: key,
    ContentType: fileType,
  });
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return { uploadUrl, key };
};

export const getDownloadFileSignedURLFromS3 = async ({ key }: { key: string }) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_FILES_BUCKET,
    Key: key,
  });
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

function getS3Key(fileName: string, userId: string) {
  const ext = path.extname(fileName).slice(1);
  return `${userId}/${randomUUID()}.${ext}`;
}
