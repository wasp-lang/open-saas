import { cn } from '../client/cn';
import { useState, useEffect, FormEvent } from 'react';
import type { File } from 'wasp/entities';
import { useQuery, getAllFilesByUser, getDownloadFileSignedURL } from 'wasp/client/operations';
import {
  type FileWithValidType,
  type FileUploadError,
  validateFile,
  uploadFileWithProgress,
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
          <h2 className='mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white'>
            <span className='text-yellow-500'>AWS</span> File Upload
          </h2>
        </div>
        <p className='mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-white'>
          This is an example file upload page using AWS S3. Maybe your app needs this. Maybe it doesn't. But a
          lot of people asked for this feature, so here you go 🤝
        </p>
        <div className='my-8 border rounded-3xl border-gray-900/10 dark:border-gray-100/10'>
          <div className='space-y-10 my-10 py-8 px-4 mx-auto sm:max-w-lg'>
            <form onSubmit={handleUpload} className='flex flex-col gap-2'>
              <input
                type='file'
                id='file-upload'
                name='file-upload'
                accept={ALLOWED_FILE_TYPES.join(',')}
                className='text-gray-600'
                onChange={() => setUploadError(null)}
              />
              <button
                type='submit'
                disabled={uploadProgressPercent > 0}
                className='min-w-[7rem] relative font-medium text-gray-800/90 bg-yellow-50 shadow-md ring-1 ring-inset ring-slate-200 py-2 px-4 rounded-md hover:bg-yellow-100 duration-200 ease-in-out focus:outline-none focus:shadow-none hover:shadow-none disabled:cursor-progress'
              >
                {uploadProgressPercent > 0 ? (
                  <>
                    <span>Uploading {uploadProgressPercent}%</span>
                    <div
                      role='progressbar'
                      aria-valuenow={uploadProgressPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className='absolute bottom-0 left-0 h-1 bg-yellow-500 transition-all duration-300 ease-in-out rounded-b-md'
                      style={{ width: `${uploadProgressPercent}%` }}
                    ></div>
                  </>
                ) : (
                  'Upload'
                )}
              </button>
              {uploadError && <div className='text-red-500'>{uploadError.message}</div>}
            </form>
            <div className='border-b-2 border-gray-200 dark:border-gray-100/10'></div>
            <div className='space-y-4 col-span-full'>
              <h2 className='text-xl font-bold'>Uploaded Files</h2>
              {allUserFiles.isLoading && <p>Loading...</p>}
              {allUserFiles.error && <p>Error: {allUserFiles.error.message}</p>}
              {!!allUserFiles.data && allUserFiles.data.length > 0 && !allUserFiles.isLoading ? (
                allUserFiles.data.map((file: File) => (
                  <div
                    key={file.key}
                    className={cn(
                      'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3',
                      {
                        'opacity-70': file.key === fileKeyForS3 && isDownloadUrlLoading,
                      }
                    )}
                  >
                    <p>{file.name}</p>
                    <button
                      onClick={() => setFileKeyForS3(file.key)}
                      disabled={file.key === fileKeyForS3 && isDownloadUrlLoading}
                      className='min-w-[7rem] text-sm text-gray-800/90 bg-purple-50 shadow-md ring-1 ring-inset ring-slate-200 py-1 px-2 rounded-md hover:bg-purple-100 duration-200 ease-in-out focus:outline-none focus:shadow-none hover:shadow-none disabled:cursor-not-allowed'
                    >
                      {file.key === fileKeyForS3 && isDownloadUrlLoading ? 'Loading...' : 'Download'}
                    </button>
                  </div>
                ))
              ) : (
                <p>No files uploaded yet :(</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
