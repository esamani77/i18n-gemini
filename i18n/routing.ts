import { defineRouting } from "next-intl/routing";

type LangCode =
  | "en"
  | "de"
  | "pk"
  | "ar"
  | "fa"
  | "hi"
  | "es"
  | "fr"
  | "tr"
  | "ja";
type Lang = {
  name: string;
  spoken: string;
  flag: string;
};
export const langs: Record<LangCode, Lang> = {
  en: {
    name: "English",
    spoken: "English",
    flag: "🇺🇸",
  },
  de: {
    name: "German",
    spoken: "deutsch",
    flag: "🇩🇪",
  },
  pk: {
    name: "Pakistani",
    spoken: "urdu",
    flag: "🇵🇰",
  },
  ar: {
    name: "Arabic",
    spoken: "عربی",
    flag: "🇸🇦",
  },
  fa: {
    name: "Persian",
    spoken: "فارسی",
    flag: "🇮🇷",
  },
  hi: {
    name: "Hindi",
    spoken: "हिंदी",
    flag: "🇮🇳",
  },
  es: {
    name: "Spanish",
    spoken: "español",
    flag: "🇪🇸",
  },
  fr: {
    name: "French",
    spoken: "français",
    flag: "🇫🇷",
  },
  tr: {
    name: "Turkish",
    spoken: "türkçe",
    flag: "🇹🇷",
  },
  ja: {
    name: "Japanese",
    spoken: "日本語",
    flag: "🇯🇵",
  },
};
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: [
    "en",
    "de",
    "pk",
    "ar",
    "fa",
    "hi",
    "es",
    "fr",
    "tr",
    "fa",
    "hi",
    "ja",
  ],

  // Used when no locale matches
  defaultLocale: "en",
});
