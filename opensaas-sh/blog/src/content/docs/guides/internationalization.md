---
title: Internationalization (i18n)
banner:
  content: |
    Have an Open SaaS app in production? <a href="https://e44cy1h4s0q.typeform.com/to/EPJCwsMi">We'll send you some swag! 👕</a>
---

This guide will show you how to serve your app in other languages than English.

Open SaaS ships with a **keyless** i18n setup, powered by [i18n-keyless](https://i18n-keyless.com). It is **off by default**: until you set an API key, the app is English-only and makes no translation request, so you can ignore this guide if you don't need it.

## How it works

With classic i18n libraries, you replace every string in your code with a key (`t("landing.hero.title")`) and maintain one JSON file per language. With a keyless setup, **the English string is the key**:

```tsx
import { T } from "i18n-keyless-react";

<Button>
  <T>Get Started</T>
</Button>;
```

The first time a visitor loads the page in a new language, the translation server translates the string once (with an LLM), stores it, and every later visitor gets it from the cache. You review and edit the translations on the server's dashboard instead of in your code.

The landing page and the navigation bar are already wrapped this way, so you can see the pattern in `src/landing-page/` and `src/client/components/NavBar/`.

## Enabling it

1. Get a project API key: sign up at [i18n-keyless.com](https://i18n-keyless.com), or [self-host the server](https://docs.i18n-keyless.com/docs/guides/self-hosting) (one Docker image, your own AI provider).
2. Add the key to your `.env.client` file:

```sh
REACT_APP_I18N_KEYLESS_API_KEY=your-public-key
# Only if you self-host. Omit to use the hosted service.
REACT_APP_I18N_KEYLESS_API_URL=https://your-instance.example.com
```

3. Restart `wasp start`.

That's it. The navigation bar now shows a language selector next to the dark mode switch, and visitors get the language of their browser on their first visit. The choice is remembered in `localStorage`.

The public key is meant to be shipped in the client bundle: it can only read translations and ask for new ones for your project.

## Translating your own strings

There are two tools, both exported by `i18n-keyless-react`:

- `<T>` for an element: `<h2><T>Frequently asked questions</T></h2>`
- `useTranslation()` for a string you hand to something else, like a `placeholder`, an `alt` or a `title`:

```tsx
import { useTranslation } from "i18n-keyless-react";

export function Hero() {
  const t = useTranslation();
  return <img alt={t("App screenshot")} src={screenshot} />;
}
```

Placeholders go through `replace`:

```tsx
t("Show {count} More", { replace: { "{count}": String(count) } });
```

For an ambiguous short string, give the translator a hint with `context`:

```tsx
<T context="Navigation menu item">Pricing</T>
```

The template only translates the marketing pages. The same one-line change applies to any other component: wrap the string in `<T>`, or call `t()`.

## Prerendering

The landing page is [prerendered](https://wasp.sh/docs/advanced/prerendering) at build time, in English. React expects the first render in the browser to match that HTML, so the SDK starts **after hydration** (from an effect in `src/client/App.tsx`), then switches to the visitor's language. Search engines index the English page; visitors see their language a few milliseconds later.

## Configuration

`src/client/i18n-keyless.ts` holds the setup: the primary language (`en`), the supported languages (every language the server can answer for), the browser language detection and the `localStorage` fallback. Edit `SUPPORTED_LANGUAGES` there to offer fewer languages in the selector.

## Removing it

If you don't want i18n at all:

1. Delete `src/client/i18n-keyless.ts`, `src/client/i18n-keyless.test.ts` and `src/client/components/LanguageSelector.tsx`.
2. Remove the `<LanguageSelector />` and `initI18nKeyless()` calls from `NavBar.tsx` and `App.tsx`.
3. Replace `<T>text</T>` with `text` and `t("text")` with `"text"` where they appear.
4. Remove `i18n-keyless-react` from `package.json`.
