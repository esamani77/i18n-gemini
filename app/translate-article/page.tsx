import type { Metadata } from "next"
import { getPageMetadata } from "@/lib/metadata"
import { ArticleTranslationForm } from "@/components/article-translation-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

// Export metadata for this page
export const metadata: Metadata = getPageMetadata(
  "/translate-article",
  "Article Translator - AI Translate Bot",
  "Translate articles, blog posts, and long-form content between languages",
)

export default function TranslateArticlePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="pl-0 flex items-center text-slate-600 hover:text-slate-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Article Translation Tool</h1>
            <p className="text-blue-50 mt-2">Translate articles, blog posts, and long-form content between languages</p>
          </div>

          <div className="p-6">
            <div className="mb-6 space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">About This Translation Service</h2>
                <p className="text-sm text-blue-700">
                  This application uses Google's Gemini API to translate long-form text content while preserving the
                  original meaning, tone, and style. The translation is performed with built-in rate limiting to respect
                  API quotas. For large articles, the process may take several minutes.
                </p>
              </div>
            </div>
            <ArticleTranslationForm />
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} AI Translate Bot. All rights reserved.</p>
        </footer>
      </div>
    </main>
  )
}
