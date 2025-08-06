import axios from 'axios';
import { type AllowedFileTypes, ALLOWED_FILE_TYPES_CONST, MAX_FILE_SIZE_BYTES } from './validation';

export type FileWithValidType = File & { type: AllowedFileTypes };

export async function uploadFileWithProgress({
  file,
  s3UploadUrl,
  s3UploadFields,
  setUploadProgressPercent,
}: {
  file: FileWithValidType;
  s3UploadUrl: string;
  s3UploadFields: Record<string, string>;
  setUploadProgressPercent: (percentage: number) => void;
}) {
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

export function validateFile(file: File): FileWithValidType {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit.`);
  }

  if (!isFileWithAllowedFileType(file)) {
    throw new Error(`File type '${file.type}' is not supported.`);
  }

  return file;
}

function isFileWithAllowedFileType(file: File): file is FileWithValidType {
  return ALLOWED_FILE_TYPES_CONST.includes(file.type as AllowedFileTypes);
}
