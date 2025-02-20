import { Dispatch, SetStateAction } from 'react';
import { createFile } from 'wasp/client/operations';
import axios from 'axios';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from './validation';

type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];
type FileWithValidType = Omit<File, 'type'> & { type: AllowedFileType };
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

type FileParseResult =
  | { kind: 'success'; file: FileWithValidType }
  | {
      kind: 'error';
      error: { message: string; code: 'INVALID_FILE_TYPE' | 'FILE_TOO_LARGE' };
    };

export function parseValidFile(file: File): FileParseResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      kind: 'error',
      error: {
        message: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`,
        code: 'FILE_TOO_LARGE',
      },
    };
  }

  if (!isAllowedFileType(file.type)) {
    return {
      kind: 'error',
      error: {
        message: `File type '${file.type}' is not supported.`,
        code: 'INVALID_FILE_TYPE',
      },
    };
  }

  return {
    kind: 'success',
    file: file as FileWithValidType,
  };
}

function isAllowedFileType(fileType: string): fileType is AllowedFileType {
  return (ALLOWED_FILE_TYPES as readonly string[]).includes(fileType);
}
