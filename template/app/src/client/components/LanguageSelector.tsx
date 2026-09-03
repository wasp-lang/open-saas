import {
  setCurrentLanguage,
  useCurrentLanguage,
  useI18nKeyless,
  useTranslation,
  type Lang,
} from "i18n-keyless-react";
import { Languages } from "lucide-react";
import { useMemo } from "react";
import {
  languageDisplayName,
  PRIMARY_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from "../i18n-keyless";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

/**
 * Lets the visitor pick the UI language. Renders nothing until i18n is
 * enabled with `REACT_APP_I18N_KEYLESS_API_KEY` (see `src/client/i18n-keyless.ts`).
 */
export function LanguageSelector() {
  const isEnabled = useI18nKeyless((state) => Boolean(state.config.API_KEY));
  const currentLanguage = useCurrentLanguage() ?? PRIMARY_LANGUAGE;
  const t = useTranslation();

  const languages = useMemo(() => {
    const collator = new Intl.Collator();
    return SUPPORTED_LANGUAGES.map((lang) => ({
      lang,
      name: languageDisplayName(lang),
    })).sort((a, b) => collator.compare(a.name, b.name));
  }, []);

  if (!isEnabled) return null;

  return (
    <Select
      value={currentLanguage}
      onValueChange={(value) => setCurrentLanguage(value as Lang)}
    >
      <SelectTrigger
        aria-label={t("Language")}
        className="h-8 w-auto gap-1 border-none px-2 shadow-none"
      >
        <Languages className="size-4" aria-hidden="true" />
        <SelectValue>{languageDisplayName(currentLanguage)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map(({ lang, name }) => (
          <SelectItem key={lang} value={lang} lang={lang}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
