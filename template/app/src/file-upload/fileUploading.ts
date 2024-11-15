import { Dispatch, SetStateAction } from 'react';
import { createFile } from 'wasp/client/operations';
import axios from 'axios';

interface UploadFileProgress {
  file: File;
  setUploadProgress: Dispatch<SetStateAction<number>>;
}

export interface FileUploadError {
  message: string;
  code: 'NO_FILE' | 'INVALID_FILE_TYPE' | 'FILE_TOO_LARGE' | 'UPLOAD_FAILED';
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB limit
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'text/*',
  'video/quicktime',
  'video/mp4',
];

export async function uploadFileWithProgress({ file, setUploadProgress }: UploadFileProgress) {
  const fileType = file.type;
  const name = file.name;

  const { uploadUrl } = await createFile({ fileType, name });

  return await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': fileType,
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        setUploadProgress(percentage);
      }
    },
  });
}

export function validateFile(file: File): FileUploadError | null {
  if (file.size > MAX_FILE_SIZE) {
    return {
      message: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`,
      code: 'FILE_TOO_LARGE',
    };
  }
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      message: `File type '${file.type}' is not supported.`,
      code: 'INVALID_FILE_TYPE',
    };
  }
  return null;
}
