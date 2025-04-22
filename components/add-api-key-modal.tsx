"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiKeyStorage } from "@/lib/api-key-storage"

interface AddApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onKeyAdded: (keyId: string) => void
}

export function AddApiKeyModal({ isOpen, onClose, onKeyAdded }: AddApiKeyModalProps) {
  const [title, setTitle] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Handle visibility with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("Please enter a title for this API key")
      return
    }

    if (!apiKey.trim()) {
      setError("Please enter an API key")
      return
    }

    try {
      const newKey = apiKeyStorage.add(title.trim(), apiKey.trim())
      onKeyAdded(newKey.id)
      onClose()
      setTitle("")
      setApiKey("")
    } catch (error) {
      setError("Failed to save API key. Please try again.")
    }
  }

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300"
      style={{ opacity: isOpen ? 1 : 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-300"
        style={{ transform: isOpen ? "scale(1)" : "scale(0.95)" }}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Add New API Key</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key-title">Title</Label>
            <Input
              id="key-title"
              placeholder="e.g., My Gemini API Key"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key-value">API Key</Label>
            <Input
              id="api-key-value"
              type="password"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-slate-500">
              Your API key will be stored locally on your device and never sent to our servers.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Save API Key
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
