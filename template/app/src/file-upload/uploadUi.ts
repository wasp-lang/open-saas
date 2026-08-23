export function getUploadButtonLabel(
  isUploading: boolean,
  uploadProgressPercent: number,
) {
  if (!isUploading) {
    return "Upload";
  }

  return uploadProgressPercent > 0
    ? `Uploading ${uploadProgressPercent}%`
    : "Uploading...";
}
