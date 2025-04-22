"use client"

import { usePathname, useRouter } from "next/navigation"
import { useLocale } from "next-intl"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Globe, Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "fa", name: "فارسی", dir: "rtl" },
]

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Get current language
  const currentLanguage = LANGUAGES.find((lang) => lang.code === locale) || LANGUAGES[0]

  // Handle language change
  const handleLanguageChange = (langCode: string) => {
    // Get the path without the locale prefix
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/"

    // Navigate to the same path but with the new locale
    router.push(`/${langCode}${pathWithoutLocale}`)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1 px-2">
        <Globe className="h-4 w-4" />
        <span className="hidden md:inline">{currentLanguage.name}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "transform rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-50">
          <div className="py-1">
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-700",
                  language.code === locale && "bg-slate-100 dark:bg-slate-700",
                )}
                onClick={() => handleLanguageChange(language.code)}
                dir={language.dir}
              >
                <span>{language.name}</span>
                {language.code === locale && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
