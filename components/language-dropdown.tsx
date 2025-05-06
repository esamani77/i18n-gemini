"use client"

import { useState, useEffect, useRef } from "react"
import { Check, ChevronDown, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LANGUAGES } from "@/lib/language-data"

interface LanguageDropdownProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  label: string
}

export function LanguageDropdown({ value, onChange, disabled = false, label }: LanguageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get the selected language
  const selectedLanguage = LANGUAGES.find((lang) => lang.code === value) || LANGUAGES[0]

  // Filter languages based on search query
  const filteredLanguages = LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Handle dropdown toggle
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      setSearchQuery("")
    }
  }

  // Handle language selection
  const handleSelect = (langCode: string) => {
    onChange(langCode)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="text-sm font-medium mb-1.5">{label}</div>
      <div
        className={cn(
          "flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer",
          isOpen ? "border-emerald-500 ring-1 ring-emerald-500" : "border-input",
          disabled && "opacity-60 cursor-not-allowed bg-slate-50",
        )}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2">
          <img
            src={`https://flagcdn.com/w20/${selectedLanguage.countryCode}.png`}
            alt={`${selectedLanguage.name} flag`}
            className="w-5 h-auto rounded-sm"
            onError={(e) => {
              // Fallback if flag doesn't load
              ;(e.target as HTMLImageElement).style.display = "none"
            }}
          />
          <div className="flex-1">
            <div className="font-medium">{selectedLanguage.name}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <span className="bg-slate-100 px-1 rounded text-slate-600">{selectedLanguage.code}</span>
              <span>{selectedLanguage.nativeName}</span>
            </div>
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "transform rotate-180")} />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg">
          <div className="p-2 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                ref={inputRef}
                placeholder="Search languages..."
                className="pl-8 pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSearchQuery("")
                    inputRef.current?.focus()
                  }}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear</span>
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <div
                  key={lang.code}
                  className={cn(
                    "flex items-center px-3 py-2 cursor-pointer hover:bg-slate-100",
                    lang.code === value && "bg-emerald-50",
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelect(lang.code)
                  }}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <img
                      src={`https://flagcdn.com/w20/${lang.countryCode}.png`}
                      alt={`${lang.name} flag`}
                      className="w-5 h-auto rounded-sm"
                      onError={(e) => {
                        // Fallback if flag doesn't load
                        ;(e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                    <div>
                      <div className="font-medium">{lang.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <span className="bg-slate-100 px-1 rounded text-slate-600">{lang.code}</span>
                        <span>{lang.nativeName}</span>
                      </div>
                    </div>
                  </div>
                  {lang.code === value && <Check className="h-4 w-4 text-emerald-500" />}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-slate-500">No languages found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
