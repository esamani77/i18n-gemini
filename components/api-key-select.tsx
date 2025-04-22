"use client"

import { useState, useEffect, useRef } from "react"
import { Check, ChevronDown, Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { apiKeyStorage, type ApiKeyEntry } from "@/lib/api-key-storage"
import { cn } from "@/lib/utils"

interface ApiKeySelectProps {
  value: string
  onChange: (value: string) => void
  onAddNew: () => void
  refreshTrigger?: number // Add this prop to trigger refreshes
}

export function ApiKeySelect({ value, onChange, onAddNew, refreshTrigger = 0 }: ApiKeySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  // Load API keys from storage
  useEffect(() => {
    setApiKeys(apiKeyStorage.getAll())
  }, [refreshTrigger]) // Add refreshTrigger as a dependency

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

  // Filter API keys based on search query
  const filteredKeys = apiKeys.filter(
    (key) =>
      key.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.value.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get the selected key's title
  const selectedKey = apiKeys.find((key) => key.value === value)

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={cn(
          "flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer",
          isOpen ? "border-emerald-500 ring-1 ring-emerald-500" : "border-input",
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 truncate">
          {selectedKey ? (
            <span className="font-medium">{selectedKey.title}</span>
          ) : (
            <span className="text-slate-400">Select an API key</span>
          )}
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "transform rotate-180")} />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg">
          <div className="p-2 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search API keys..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredKeys.length > 0 ? (
              filteredKeys.map((key) => (
                <div
                  key={key.id}
                  className={cn(
                    "flex items-center px-3 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700",
                    key.value === value && "bg-emerald-50 dark:bg-emerald-900/20",
                  )}
                  onClick={() => {
                    onChange(key.value)
                    setIsOpen(false)
                  }}
                >
                  <div className="flex-1">
                    <div className="font-medium">{key.title}</div>
                    <div className="text-xs text-slate-500">
                      {key.value.substring(0, 8)}...{key.value.substring(key.value.length - 4)}
                    </div>
                  </div>
                  {key.value === value && <Check className="h-4 w-4 text-emerald-500" />}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-slate-500">No API keys found</div>
            )}
          </div>

          <div
            className="flex items-center gap-2 p-2 border-t border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={(e) => {
              e.stopPropagation()
              onAddNew()
            }}
          >
            <Plus className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Add new API key</span>
          </div>
        </div>
      )}
    </div>
  )
}
