"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl";
export function LanguageLearningBox() {
  const t = useTranslations("LanguageLearningBox");
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Don't show on download page
  const shouldShow = pathname !== "/download"

  useEffect(() => {
    if (shouldShow) {
      // Show after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1500)

      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [pathname, shouldShow])

  const handleClick = () => {
    // Push event to dataLayer for GTM
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "language_box_clicked",
        eventCategory: "User Engagement",
        eventAction: "Click",
        eventLabel: "Language Learning Box",
      })
    }

    router.push("/download")
  }

  if (!shouldShow) return null

  return (
    <div
      className={`fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-lg border border-yellow-200 p-3 sm:p-4 transition-all duration-300 z-50 max-w-[90%] sm:max-w-md ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex-shrink-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-aY6VjVniTPcg2V4CM6LqMHadornt6B.png"
            alt="Memoryto Logo"
            width={50}
            height={50}
            className="w-10 h-10 sm:w-12 sm:h-12"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg text-gray-800 truncate">
            {t("title")}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
            {t("subtitle")}
          </p>
          <Button
            className="bg-yellow-500 hover:bg-yellow-600 text-white w-full text-xs sm:text-sm py-1 h-auto"
            onClick={handleClick}
          >
            {t("button")}
          </Button>
        </div>
        <button
          className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 p-1"
          onClick={() => setIsVisible(false)}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="sr-only">{t("close")}</span>
        </button>
      </div>
    </div>
  )
}
