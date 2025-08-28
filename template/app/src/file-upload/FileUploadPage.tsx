import { FormEvent, useEffect, useState } from 'react';
import { getAllFilesByUser, getDownloadFileSignedURL, useQuery } from 'wasp/client/operations';
import type { File } from 'wasp/entities';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { cn } from '../lib/utils';
import {
  type FileUploadError,
  type FileWithValidType,
  uploadFileWithProgress,
  validateFile,
} from './fileUploading';
import { ALLOWED_FILE_TYPES } from './validation';

export default function FileUploadPage() {
  const [fileKeyForS3, setFileKeyForS3] = useState<File['key']>('');
  const [uploadProgressPercent, setUploadProgressPercent] = useState<number>(0);
  const [uploadError, setUploadError] = useState<FileUploadError | null>(null);

  const allUserFiles = useQuery(getAllFilesByUser, undefined, {
    // We disable automatic refetching because otherwise files would be refetched after `createFile` is called and the S3 URL is returned,
    // which happens before the file is actually fully uploaded. Instead, we manually (re)fetch on mount and after the upload is complete.
    enabled: false,
  });
  const { isLoading: isDownloadUrlLoading, refetch: refetchDownloadUrl } = useQuery(
    getDownloadFileSignedURL,
    { key: fileKeyForS3 },
    { enabled: false }
  );

  useEffect(() => {
    allUserFiles.refetch();
  }, []);

  useEffect(() => {
    if (fileKeyForS3.length > 0) {
      refetchDownloadUrl()
        .then((urlQuery) => {
          switch (urlQuery.status) {
            case 'error':
              console.error('Error fetching download URL', urlQuery.error);
              alert('Error fetching download');
              return;
            case 'success':
              window.open(urlQuery.data, '_blank');
              return;
          }
        })
        .finally(() => {
          setFileKeyForS3('');
        });
    }
  }, [fileKeyForS3]);

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      const formElement = e.target;
      if (!(formElement instanceof HTMLFormElement)) {
        throw new Error('Event target is not a form element');
      }

      const formData = new FormData(formElement);
      const file = formData.get('file-upload');

      if (!file || !(file instanceof File)) {
        setUploadError({
          message: 'Please select a file to upload.',
          code: 'NO_FILE',
        });
        return;
      }

      const fileValidationError = validateFile(file);
      if (fileValidationError !== null) {
        setUploadError(fileValidationError);
        return;
      }

      await uploadFileWithProgress({ file: file as FileWithValidType, setUploadProgressPercent });
      formElement.reset();
      allUserFiles.refetch();
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError({
        message:
          error instanceof Error ? error.message : 'An unexpected error occurred while uploading the file.',
        code: 'UPLOAD_FAILED',
      });
    } finally {
      setUploadProgressPercent(0);
    }
  };

  return (
    <div className='py-10 lg:mt-10'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl text-center'>
          <h2 className='mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>
            <span className='text-primary'>AWS</span> File Upload
          </h2>
        </div>
        <p className='mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-muted-foreground'>
          This is an example file upload page using AWS S3. Maybe your app needs this. Maybe it doesn't. But a
          lot of people asked for this feature, so here you go 🤝
        </p>
        <Card className='my-8'>
          <CardContent className='space-y-10 my-10 py-8 px-4 mx-auto sm:max-w-lg'>
            <form onSubmit={handleUpload} className='flex flex-col gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='file-upload' className='text-sm font-medium text-foreground'>
                  Select a file to upload
                </Label>
                <Input
                  type='file'
                  id='file-upload'
                  name='file-upload'
                  accept={ALLOWED_FILE_TYPES.join(',')}
                  onChange={() => setUploadError(null)}
                  className='cursor-pointer'
                />
              </div>
              <div className='space-y-2'>
                <Button type='submit' disabled={uploadProgressPercent > 0} className='w-full'>
                  {uploadProgressPercent > 0 ? `Uploading ${uploadProgressPercent}%` : 'Upload'}
                </Button>
                {uploadProgressPercent > 0 && <Progress value={uploadProgressPercent} className='w-full' />}
              </div>
              {uploadError && (
                <Alert variant='destructive'>
                  <AlertDescription>{uploadError.message}</AlertDescription>
                </Alert>
              )}
            </form>
            <div className='border-b-2 border-border'></div>
            <div className='space-y-4 col-span-full'>
              <CardTitle className='text-xl font-bold text-foreground'>Uploaded Files</CardTitle>
              {allUserFiles.isLoading && <p className='text-muted-foreground'>Loading...</p>}
              {allUserFiles.error && (
                <Alert variant='destructive'>
                  <AlertDescription>Error: {allUserFiles.error.message}</AlertDescription>
                </Alert>
              )}
              {!!allUserFiles.data && allUserFiles.data.length > 0 && !allUserFiles.isLoading ? (
                <div className='space-y-3'>
                  {allUserFiles.data.map((file: File) => (
                    <Card key={file.key} className='p-4'>
                      <div
                        className={cn(
                          'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3',
                          {
                            'opacity-70': file.key === fileKeyForS3 && isDownloadUrlLoading,
                          }
                        )}
                      >
                        <p className='text-foreground font-medium'>{file.name}</p>
                        <Button
                          onClick={() => setFileKeyForS3(file.key)}
                          disabled={file.key === fileKeyForS3 && isDownloadUrlLoading}
                          variant='outline'
                          size='sm'
                        >
                          {file.key === fileKeyForS3 && isDownloadUrlLoading ? 'Loading...' : 'Download'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground text-center'>No files uploaded yet :(</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
