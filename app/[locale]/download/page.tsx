import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/metadata";
import DownloadPageClient from "./DownloadPageClient";
import { getTranslations } from "next-intl/server";

// Export metadata for this page
// export const metadata: Metadata = getPageMetadata(
//   "/download",
//   "Download Memoryto - AI Translate Bot",
//   "Download Memoryto app for language learning with AI-powered spaced repetition",
// )

export async function generateMetadata(props: any): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations("meta");
  return {
    title: t("title_download"),
    description: t("description_download"),
    alternates: {
      canonical: `https://www.aitranslatebot.top/${params.locale}/download`,
    },
  };
}

export default function DownloadPage() {
  return <DownloadPageClient />;
}
