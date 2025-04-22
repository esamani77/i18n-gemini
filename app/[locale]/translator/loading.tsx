"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

export default function Loading() {
  const t = useTranslations()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="h-16 w-16 text-emerald-500 animate-spin mb-4" />
      <h2 className="text-2xl font-semibold text-slate-700">{t("loading.title")}</h2>
      <p className="text-slate-500 mt-2">{t("loading.description")}</p>
    </div>
  )
}
