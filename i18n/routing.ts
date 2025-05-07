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
  | "zh"
  | "tr"
  | "kr"
  | "ku"
  | "nl"
  | "it"
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
  zh: {
    name: "Chinese",
    spoken: "中文",
    flag: "🇨🇳",
  },
  kr: {
    name: "Korean",
    spoken: "한국어",
    flag: "🇰🇷",
  },
  ku: {
    name: "Kurdish",
    spoken: "Kurdî",
    flag: "🇰🇷",
  },
  nl: {
    name: "Dutch",
    spoken: "Nederlands",
    flag: "🇳🇱",
  },
  it: {
    name: "Italian",
    spoken: "italiano",
    flag: "🇮🇹",
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
    "zh",
    "kr",
    "ku",
    "nl",
    "it",
  ],

  // Used when no locale matches
  defaultLocale: "en",
});
