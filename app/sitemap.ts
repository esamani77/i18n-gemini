import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
export default function sitemap(): MetadataRoute.Sitemap {
  const site = "https://www.aitranslatebot.top";
  const pages = [
    "/",
    "/translator",
    "/improve-json",
    "/translate-article",
    "/download",
  ];
  const locales = routing.locales;
  const sitemap = pages.map((page) => {
    return locales.map((locale) => {
      return {
        url: `${site}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
      };
    });
  });

  return sitemap.flat();
}
