import S3 from 'aws-sdk/clients/s3.js';
import { randomUUID } from 'crypto';

const s3Client = new S3({
  apiVersion: '2006-03-01',
  accessKeyId: process.env.AWS_S3_IAM_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_IAM_SECRET_KEY,
  region: process.env.AWS_S3_REGION,
  signatureVersion: 'v4',
});

type S3Upload = {
  fileType: string;
  userInfo: string;
}

export const getUploadFileSignedURLFromS3 = ({fileType, userInfo}: S3Upload) => {

  const ex = fileType.split('/')[1];

  const Key = `${userInfo}/${randomUUID()}.${ex}`;
  const s3Params = {
    Bucket: process.env.AWS_S3_FILES_BUCKET,
    Key,
    Expires: 30,
    ContentType: `${fileType}`,
  };
  const uploadUrl = s3Client.getSignedUrl("putObject", s3Params);
  return { uploadUrl, key: Key };
}

export const getDownloadFileSignedURLFromS3 = ({ key }: { key: string }) => {
  const s3Params = {
    Bucket: process.env.AWS_S3_FILES_BUCKET,
    Key: key,
    Expires: 30,
  };
  return s3Client.getSignedUrl("getObject", s3Params);
}