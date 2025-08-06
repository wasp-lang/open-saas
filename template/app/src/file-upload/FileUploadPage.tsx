import { FormEvent, useEffect, useState } from 'react';
import {
  getAllFilesByUser,
  getDownloadFileSignedURL,
  useQuery,
  createFileUploadUrl,
  addFileToDb,
  deleteFile,
} from 'wasp/client/operations';
import type { File } from 'wasp/entities';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardTitle } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { cn } from '../lib/utils';
import { uploadFileWithProgress, validateFile } from './fileUploading';
import { ALLOWED_FILE_TYPES } from './validation';
import { Trash, Download } from 'lucide-react';
import { toast } from '../hooks/use-toast';

export default function FileUploadPage() {
  const [fileKeyForS3, setFileKeyForS3] = useState<File['s3Key']>('');
  const [uploadProgressPercent, setUploadProgressPercent] = useState<number>(0);
  const [fileToDelete, setFileToDelete] = useState<Pick<File, 'id' | 's3Key' | 'name'> | null>(null);

  const allUserFiles = useQuery(getAllFilesByUser, undefined, {
    // We disable automatic refetching because otherwise files would be refetched after `createFile` is called and the S3 URL is returned,
    // which happens before the file is actually fully uploaded. Instead, we manually (re)fetch on mount and after the upload is complete.
    enabled: false,
  });
  const { isLoading: isDownloadUrlLoading, refetch: refetchDownloadUrl } = useQuery(
    getDownloadFileSignedURL,
    { s3Key: fileKeyForS3 },
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
              toast({
                title: 'Error fetching download link',
                description: 'Please try again later.',
                variant: 'destructive',
              });
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
      const formDataFileUpload = formData.get('file-upload');

      if (!formDataFileUpload || !(formDataFileUpload instanceof File) || formDataFileUpload.size === 0) {
        toast({
          title: 'No file selected',
          description: 'Please select a file to upload.',
          variant: 'destructive',
        });
        return;
      }

      const file = validateFile(formDataFileUpload);

      const { s3UploadUrl, s3UploadFields, s3Key } = await createFileUploadUrl({
        fileType: file.type,
        fileName: file.name,
      });

      await uploadFileWithProgress({
        file,
        s3UploadUrl,
        s3UploadFields,
        setUploadProgressPercent,
      });

      await addFileToDb({
        s3Key,
        fileType: file.type,
        fileName: file.name,
      });

      formElement.reset();
      allUserFiles.refetch();
      toast({
        title: 'File uploaded',
        description: 'Your file has been successfully uploaded.',
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error uploading file.';
      toast({
        title: 'Error uploading file',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUploadProgressPercent(0);
    }
  };

  return (
    <>
      <div className='py-10 lg:mt-10'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            <h2 className='mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>
              <span className='text-primary'>AWS</span> File Upload
            </h2>
          </div>
          <p className='mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-muted-foreground'>
            This is an example file upload page using AWS S3. Maybe your app needs this. Maybe it doesn't. But
            a lot of people asked for this feature, so here you go 🤝
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
                    className='cursor-pointer'
                  />
                </div>
                <div className='space-y-2'>
                  <Button type='submit' disabled={uploadProgressPercent > 0} className='w-full'>
                    {uploadProgressPercent > 0 ? `Uploading ${uploadProgressPercent}%` : 'Upload'}
                  </Button>
                  {uploadProgressPercent > 0 && <Progress value={uploadProgressPercent} className='w-full' />}
                </div>
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
                      <Card key={file.s3Key} className='p-4'>
                        <div
                          className={cn(
                            'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3',
                            {
                              'opacity-70': file.s3Key === fileKeyForS3 && isDownloadUrlLoading,
                            }
                          )}
                        >
                          <p className='text-foreground font-medium'>{file.name}</p>
                          <div className='flex items-center justify-end gap-2'>
                            <Button
                              onClick={() => setFileKeyForS3(file.s3Key)}
                              disabled={file.s3Key === fileKeyForS3 && isDownloadUrlLoading}
                              variant='outline'
                              size='sm'
                            >
                              <Download className='h-5 w-5' />
                            </Button>
                            <Button
                              onClick={() => setFileToDelete(file)}
                              variant='outline'
                              size='sm'
                              aria-label='Delete file'
                            >
                              <Trash className='h-5 w-5 text-destructive' />
                            </Button>
                          </div>
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
      {fileToDelete && (
        <Dialog open={!!fileToDelete} onOpenChange={(isOpen) => !isOpen && setFileToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete file</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{fileToDelete.name}</strong>? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant='outline' onClick={() => setFileToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={async () => {
                  try {
                    await deleteFile({ id: fileToDelete.id });
                    toast({
                      title: 'File deleted',
                      description: (
                        <span>
                          File <strong>{fileToDelete.name}</strong> deleted.
                        </span>
                      ),
                    });
                    allUserFiles.refetch();
                  } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Error deleting file.';
                    toast({
                      title: 'Error',
                      description: errorMessage,
                      variant: 'destructive',
                    });
                  } finally {
                    setFileToDelete(null);
                  }
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
