import { describe, expect, it, vi } from "vitest";
import {
  detectBrowserLanguage,
  languageDisplayName,
  resolveStorage,
  type KeyValueStorage,
} from "./i18n-keyless";

describe("detectBrowserLanguage", () => {
  it("picks the first supported browser language, most preferred first", () => {
    expect(detectBrowserLanguage(["de-AT", "en-US"])).toBe("de");
  });

  it("maps regional Chinese tags to the script the server supports", () => {
    expect(detectBrowserLanguage(["zh-CN"])).toBe("zh-Hans");
    expect(detectBrowserLanguage(["zh-TW"])).toBe("zh-Hant");
  });

  it("falls back to English for unknown tags and an empty list", () => {
    expect(detectBrowserLanguage(["tlh"])).toBe("en");
    expect(detectBrowserLanguage([])).toBe("en");
  });
});

describe("languageDisplayName", () => {
  it("names a language in that language", () => {
    expect(languageDisplayName("de")).toBe("Deutsch");
    expect(languageDisplayName("fr")).toBe("français");
  });
});

describe("resolveStorage", () => {
  function fakeStorage(overrides: Partial<KeyValueStorage> = {}) {
    return {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      ...overrides,
    } as unknown as KeyValueStorage;
  }

  it("returns the browser storage when it is usable", () => {
    const storage = fakeStorage();
    expect(resolveStorage(() => storage)).toBe(storage);
  });

  it("falls back to memory when reading the property throws", () => {
    const storage = resolveStorage(() => {
      throw new Error("SecurityError");
    });
    expect(storage).not.toBeNull();
    storage.setItem("k", "v");
    expect(storage.getItem("k")).toBe("v");
  });

  it("falls back to memory when the storage throws on first use", () => {
    const storage = resolveStorage(() =>
      fakeStorage({
        getItem: vi.fn(() => {
          throw new Error("QuotaExceededError");
        }),
      }),
    );
    storage.setItem("k", "v");
    expect(storage.getItem("k")).toBe("v");
  });

  it("falls back to memory when there is no storage at all", () => {
    const storage = resolveStorage(() => undefined);
    storage.setItem("k", "v");
    expect(storage.getItem("k")).toBe("v");
  });
});
