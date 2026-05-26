import { action, page, query, route, type Part } from "@wasp.sh/spec";

import { group } from "../shared/utils.wasp";
import { FileUploadPage } from "./FileUploadPage" with { type: "ref" };
import {
  addFileToDb,
  createFileUploadUrl,
  deleteFile,
  getAllFilesByUser,
  getDownloadFileSignedURL,
} from "./operations" with { type: "ref" };

export const fileUpload: Part[] = [
  route(
    "FileUploadRoute",
    "/file-upload",
    page(FileUploadPage, { authRequired: true }),
  ),

  ...group({ entities: ["User", "File"] }, [
    query(getAllFilesByUser),
    query(getDownloadFileSignedURL),
    action(createFileUploadUrl),
    action(addFileToDb),
    action(deleteFile),
  ]),
];
