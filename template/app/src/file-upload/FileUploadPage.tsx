import { createFile, useQuery, getAllFilesByUser, getDownloadFileSignedURL } from 'wasp/client/operations';
import axios from 'axios';
import { useState, useEffect, FormEvent } from 'react';
import { cn } from '../client/cn';
import { useTranslation } from 'react-i18next';

export default function FileUploadPage() {
  const { t } = useTranslation();
  const [fileToDownload, setFileToDownload] = useState<string>('');

  const { data: files, error: filesError, isLoading: isFilesLoading } = useQuery(getAllFilesByUser);
  const { isLoading: isDownloadUrlLoading, refetch: refetchDownloadUrl } = useQuery(
    getDownloadFileSignedURL,
    { key: fileToDownload },
    { enabled: false }
  );

  useEffect(() => {
    if (fileToDownload.length > 0) {
      refetchDownloadUrl()
        .then((urlQuery) => {
          switch (urlQuery.status) {
            case 'error':
              console.error('Error fetching download URL', urlQuery.error);
              alert(t('fileUpload.errors.downloadError.fetchFailed'));
              return;
            case 'success':
              window.open(urlQuery.data, '_blank');
              return;
          }
        })
        .finally(() => {
          setFileToDownload('');
        });
    }
  }, [fileToDownload, t]);

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const file = formData.get('file-upload') as File;
      if (!file || !file.name || !file.type) {
        throw new Error(t('fileUpload.errors.uploadError.noFile'));
      }

      const fileType = file.type;
      const name = file.name;

      const { uploadUrl } = await createFile({ fileType, name });
      if (!uploadUrl) {
        throw new Error(t('fileUpload.errors.uploadError.uploadFailed'));
      }
      const res = await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': fileType,
        },
      });
      if (res.status !== 200) {
        throw new Error(t('fileUpload.errors.uploadError.s3Failed'));
      }
    } catch (error) {
      alert(t('fileUpload.errors.uploadError.generic'));
      console.error('Error uploading file', error);
    }
  };

  return (
    <div className='py-10 lg:mt-10'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl text-center'>
          <h2 className='mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white'>
            <span className='text-yellow-500'>AWS</span> {t('fileUpload.title')}
          </h2>
        </div>
        <p className='mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-white'>
          {t('fileUpload.subtitle')}
        </p>
        <div className='my-8 border rounded-3xl border-gray-900/10 dark:border-gray-100/10'>
          <div className='space-y-10 my-10 py-8 px-4 mx-auto sm:max-w-lg'>
            <form onSubmit={handleUpload} className='flex flex-col gap-2'>
              <input
                type='file'
                name='file-upload'
                accept='image/jpeg, image/png, .pdf, text/*'
                className='text-gray-600'
              />
              <button
                type='submit'
                className='min-w-[7rem] font-medium text-gray-800/90 bg-yellow-50 shadow-md ring-1 ring-inset ring-slate-200 py-2 px-4 rounded-md hover:bg-yellow-100 duration-200 ease-in-out focus:outline-none focus:shadow-none hover:shadow-none'
              >
                {t('fileUpload.uploadButton')}
              </button>
            </form>
            <div className='border-b-2 border-gray-200 dark:border-gray-100/10'></div>
            <div className='space-y-4 col-span-full'>
              <h2 className='text-xl font-bold'>{t('fileUpload.uploadedFiles')}</h2>
              {isFilesLoading && <p>{t('fileUpload.loading')}</p>}
              {filesError && <p>Error: {filesError.message}</p>}
              {!!files && files.length > 0 ? (
                files.map((file: any) => (
                  <div
                    key={file.key}
                    className={cn('flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3', {
                      'opacity-70': file.key === fileToDownload && isDownloadUrlLoading,
                    })}
                  >
                    <p>{file.name}</p>
                    <button
                      onClick={() => setFileToDownload(file.key)}
                      disabled={file.key === fileToDownload && isDownloadUrlLoading}
                      className='min-w-[7rem] text-sm text-gray-800/90 bg-purple-50 shadow-md ring-1 ring-inset ring-slate-200 py-1 px-2 rounded-md hover:bg-purple-100 duration-200 ease-in-out focus:outline-none focus:shadow-none hover:shadow-none disabled:cursor-not-allowed'
                    >
                      {file.key === fileToDownload && isDownloadUrlLoading
                        ? t('fileUpload.loading')
                        : t('fileUpload.downloadButton')}
                    </button>
                  </div>
                ))
              ) : (
                <p>{t('fileUpload.noFiles')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
