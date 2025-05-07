import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/metadata";
import { ArticleTranslationForm } from "@/components/article-translation-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
// // Export metadata for this page
// export const metadata: Metadata = getPageMetadata(
//   "/translate-article",
//   "Article Translator - AI Translate Bot",
//   "Translate articles, blog posts, and long-form content between languages",
// )

export async function generateMetadata(props: any): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations("meta");
  return {
    title: t("title_article"),
    description: t("description_article"),
    alternates: {
      canonical: `https://www.aitranslatebot.top/${params.locale}/translate-article`,
    },
  };
}

export default function TranslateArticlePage() {
  const t = useTranslations("translate-article");
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button
              variant="ghost"
              className="pl-0 flex items-center text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("back")}
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {t("title")}
            </h1>
            <p className="text-blue-50 mt-2">{t("subtitle")}</p>
          </div>

          <div className="p-6">
            <div className="mb-6 space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">
                  {t("about")}
                </h2>
                <p className="text-sm text-blue-700">{t("about")}</p>
              </div>
            </div>
            <ArticleTranslationForm />
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-slate-500">
          <p>
            © {new Date().getFullYear()} AI Translate Bot. {t("copyright")}
          </p>
        </footer>
      </div>
    </main>
  );
}
