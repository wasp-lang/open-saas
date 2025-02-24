import { Dispatch, SetStateAction } from 'react';
import { createFile } from 'wasp/client/operations';
import axios from 'axios';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from './validation';

export type FileWithValidType = Omit<File, 'type'> & { type: AllowedFileType };
type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];
interface FileUploadProgress {
  file: FileWithValidType;
  setUploadProgressPercent: Dispatch<SetStateAction<number>>;
}

export async function uploadFileWithProgress({ file, setUploadProgressPercent }: FileUploadProgress) {
  const { uploadUrl } = await createFile({ fileType: file.type, fileName: file.name });
  return axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        setUploadProgressPercent(percentage);
      }
    },
  });
}

export interface FileUploadError {
  message: string;
  code: 'NO_FILE' | 'INVALID_FILE_TYPE' | 'FILE_TOO_LARGE' | 'UPLOAD_FAILED';
}

export function validateFile(file: File) {
  if (file.size > MAX_FILE_SIZE) {
    return {
      message: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`,
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
