import type { CleanUpOrphanedFilesS3Job } from 'wasp/server/jobs';
import { s3Client, deleteFileFromS3 } from './s3Utils';
import { ListObjectsV2Command, ListObjectsV2CommandOutput } from '@aws-sdk/client-s3';

export const cleanUpOrphanedFilesS3: CleanUpOrphanedFilesS3Job<never, void> = async (
  _args,
  context
) => {
  const allFileKeysFromS3 = await fetchAllFileKeysFromS3();
  const allFileKeysFromDb = await context.entities.File.findMany({
    select: { s3Key: true },
  });
  await findAndDeleteOrphanedFilesInS3(allFileKeysFromS3, allFileKeysFromDb);
};

const fetchAllFileKeysFromS3 = async () => {
  const allS3Keys: string[] = [];
  let continuationToken: string | undefined = undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_FILES_BUCKET,
      ContinuationToken: continuationToken,
    });

    const response: ListObjectsV2CommandOutput = await s3Client.send(command);

    if (response.Contents) {
      const keys = response.Contents.reduce((acc: string[], object) => {
        if (object.Key) {
          acc.push(object.Key);
        }
        return acc;
      }, []);
      allS3Keys.push(...keys);
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  console.log(`Found ${allS3Keys.length} total files in S3`);

  return allS3Keys;
};

const findAndDeleteOrphanedFilesInS3 = async (
  allFileKeysFromS3: string[],
  allFileKeysFromDb: { s3Key: string }[]
) => {
  const s3KeysNotFoundInDb = allFileKeysFromS3.filter(
    (s3Key) => !allFileKeysFromDb.some((file) => file.s3Key === s3Key)
  );

  // Delete files from S3 that are not in the database
  // If any file deletion fails, the job can continue and pick it up next run.
  const s3DeletionResults = await Promise.allSettled(
    s3KeysNotFoundInDb.map((s3Key) => deleteFileFromS3({ s3Key }))
  );

  const successfulDeletions = s3DeletionResults.filter((result) => result.status === 'fulfilled');

  console.log(
    `Successfully deleted ${successfulDeletions.length} out of ${s3KeysNotFoundInDb.length} orphaned files from S3`
  );
};
