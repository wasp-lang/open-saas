import { createFile } from 'wasp/client/operations';
import axios from 'axios';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from './validation';

export type FileWithValidType = Omit<File, 'type'> & { type: AllowedFileType };
type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];
interface FileUploadProgress {
  file: FileWithValidType;
  setUploadProgressPercent: (percentage: number) => void;
}

export async function uploadFileWithProgress({ file, setUploadProgressPercent }: FileUploadProgress) {
  const { s3UploadUrl, s3UploadFields } = await createFile({ fileType: file.type, fileName: file.name });

  const formData = getFileUploadFormData(file, s3UploadFields);

  return axios.post(s3UploadUrl, formData, {
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        setUploadProgressPercent(percentage);
      }
    },
  });
}

function getFileUploadFormData(file: File, s3UploadFields: Record<string, string>) {
  const formData = new FormData();
  Object.entries(s3UploadFields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append('file', file);
  return formData;
}

export interface FileUploadError {
  message: string;
  code: 'NO_FILE' | 'INVALID_FILE_TYPE' | 'FILE_TOO_LARGE' | 'UPLOAD_FAILED';
}

export function validateFile(file: File) {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      message: `File size exceeds ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit.`,
      code: 'FILE_TOO_LARGE' as const,
    };
  }

  if (!isAllowedFileType(file.type)) {
    return {
      message: `File type '${file.type}' is not supported.`,
      code: 'INVALID_FILE_TYPE' as const,
    };
  }

  return null;
}

function isAllowedFileType(fileType: string): fileType is AllowedFileType {
  return (ALLOWED_FILE_TYPES as readonly string[]).includes(fileType);
}
