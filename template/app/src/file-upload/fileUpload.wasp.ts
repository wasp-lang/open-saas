import { action, page, query, route, type Part } from '@wasp.sh/spec'

import { FileUploadPage } from './FileUploadPage' with { type: 'ref' }
import {
  createFileUploadUrl,
  addFileToDb,
  getAllFilesByUser,
  getDownloadFileSignedURL,
  deleteFile,
} from './operations' with { type: 'ref' }

export const fileUploadParts: Part[] = [
  route('FileUploadRoute', '/file-upload', page(FileUploadPage, { authRequired: true })),
  action(createFileUploadUrl, { entities: ['User', 'File'] }),
  action(addFileToDb, { entities: ['User', 'File'] }),
  query(getAllFilesByUser, { entities: ['User', 'File'] }),
  query(getDownloadFileSignedURL, { entities: ['User', 'File'] }),
  action(deleteFile, { entities: ['User', 'File'] }),
]
