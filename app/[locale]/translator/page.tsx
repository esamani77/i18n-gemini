"use client"

import TranslationForm from "@/components/translation-form"
import { RateLimitInfo } from "@/components/rate-limit-info"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useTranslations } from "next-intl"

export default function TranslatorPage() {
  const t = useTranslations()

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="pl-0 flex items-center text-slate-600 hover:text-slate-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("navigation.back")}
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{t("translator.title")}</h1>
            <p className="text-emerald-50 mt-2">{t("translator.subtitle")}</p>
          </div>

          <div className="p-6">
            <div className="mb-6 space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">{t("translator.about.title")}</h2>
                <p className="text-sm text-blue-700">{t("translator.about.description")}</p>
              </div>

              <RateLimitInfo />
            </div>
            <TranslationForm />
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-slate-500">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
        </footer>
      </div>
    </main>
  )
}
