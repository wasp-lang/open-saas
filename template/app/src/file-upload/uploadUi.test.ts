import { describe, expect, it } from "vitest";
import { getUploadButtonLabel } from "./uploadUi";

describe("getUploadButtonLabel", () => {
  it("shows immediate feedback before upload progress is reported", () => {
    expect(getUploadButtonLabel(true, 0)).toBe("Uploading...");
  });

  it("shows progress while uploading", () => {
    expect(getUploadButtonLabel(true, 42)).toBe("Uploading 42%");
  });

  it("shows the idle label when no upload is active", () => {
    expect(getUploadButtonLabel(false, 0)).toBe("Upload");
  });
});
