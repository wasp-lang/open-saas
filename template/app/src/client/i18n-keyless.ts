import {
  AVAILABLE_LANGS,
  createMemoryStorage,
  init,
  resolveLang,
  type I18nConfig,
  type Lang,
} from "i18n-keyless-react";

/**
 * Keyless internationalization (i18n) of the UI.
 *
 * The English string in the JSX is the key: `<T>Get Started</T>`. There is no
 * locale file and no key name to invent. The first time a string is rendered
 * in a new language, the translation server translates it once (with an LLM),
 * stores it, and every later visitor gets it from the cache. You review and
 * fix translations on the server's dashboard, not in JSON files.
 *
 * It is opt-in, configured with two client env vars (see `.env.client.example`):
 *
 *   REACT_APP_I18N_KEYLESS_API_KEY  the project's public key (enables i18n)
 *   REACT_APP_I18N_KEYLESS_API_URL  your self-hosted server; omit for the hosted one
 *
 * Without a key the app stays English and makes no network request: `<T>`
 * renders its child string as-is and the language selector is not rendered.
 *
 * Docs: https://docs.opensaas.sh/guides/internationalization/
 */

export const PRIMARY_LANGUAGE: Lang = "en";

/** Every language the translation server can answer for. */
export const SUPPORTED_LANGUAGES: readonly Lang[] = AVAILABLE_LANGS;

/**
 * Picks the first browser language we support, most preferred first.
 * `zh-CN` resolves to `zh-Hans`, `de-AT` to `de`, an unknown tag to English.
 */
export function detectBrowserLanguage(preferred: readonly string[]): Lang {
  for (const tag of preferred) {
    const lang = resolveLang(tag, { supported: SUPPORTED_LANGUAGES });
    if (lang) return lang;
  }
  return PRIMARY_LANGUAGE;
}

/** Native display name of a language, in that language ("Deutsch", "ไทย"). */
export function languageDisplayName(lang: Lang): string {
  try {
    return new Intl.DisplayNames([lang], { type: "language" }).of(lang) ?? lang;
  } catch {
    return lang;
  }
}

type SdkStorage = NonNullable<I18nConfig["storage"]>;
/** A storage adapter with the three methods the SDK reads and writes through. */
export type KeyValueStorage = SdkStorage &
  Required<Pick<SdkStorage, "getItem" | "setItem" | "removeItem">>;

/**
 * The persistent cache for translations and the chosen language. A browser
 * can deny `localStorage` (privacy mode, blocked site data): reading the
 * property itself throws. In that case the SDK runs on an in-memory store,
 * so the language choice lasts for the session and nothing aborts startup.
 */
export function resolveStorage(
  read: () => KeyValueStorage | undefined,
): KeyValueStorage {
  try {
    const storage = read();
    if (!storage) return createMemoryStorage() as KeyValueStorage;
    // Some browsers expose the object and throw on first use.
    storage.getItem("i18n-keyless:probe");
    return storage;
  } catch {
    return createMemoryStorage() as KeyValueStorage;
  }
}

/**
 * Starts the SDK in the browser. Call it once, after hydration.
 *
 * The landing page is prerendered at build time (no `window` there), and React
 * expects the first client render to match that HTML: both stay English. The
 * stored or browser language is applied right after hydration, which is why
 * `App` calls this from an effect and not from Wasp's client `setupFn`.
 */
export function initI18nKeyless(): void {
  if (import.meta.env.SSR || typeof window === "undefined") return;

  const apiKey = import.meta.env.REACT_APP_I18N_KEYLESS_API_KEY as
    | string
    | undefined;
  if (!apiKey) return;
  const apiUrl = import.meta.env.REACT_APP_I18N_KEYLESS_API_URL as
    | string
    | undefined;

  try {
    init({
      API_KEY: apiKey,
      ...(apiUrl ? { API_URL: apiUrl } : {}),
      storage: resolveStorage(() => window.localStorage),
      languages: {
        primary: PRIMARY_LANGUAGE,
        supported: [...SUPPORTED_LANGUAGES],
        fallback: PRIMARY_LANGUAGE,
        initWithDefault: detectBrowserLanguage(
          navigator.languages ?? [navigator.language],
        ),
      },
    }).catch((error: unknown) => {
      console.warn(
        "i18n-keyless: translations unavailable, the UI stays in English",
        error,
      );
    });
  } catch (error) {
    // Translation is a progressive enhancement: never block the first render.
    console.warn(
      "i18n-keyless: initialization failed, the UI stays in English",
      error,
    );
  }
}
