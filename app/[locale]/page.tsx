import ClientPage from "./ClientPage";
import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/metadata";
import { getTranslations } from "next-intl/server";

// Export metadata for this page
// export const generateMetadata: Metadata = getPageMetadata(
//   "/",
//   "AI Translate Bot - Translate JSON Files with AI Precision",
//   "Fast, accurate, and structure-preserving translations powered by Google's Gemini API",
// )

export async function generateMetadata(props: any): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations("meta");
  return {
    title: t("title_home"),
    description: t("description_home"),
    alternates: {
      canonical: `https://www.aitranslatebot.top/${params.locale}`,
    },
  };
}

export default function LandingPage() {
  return <ClientPage />;
}
