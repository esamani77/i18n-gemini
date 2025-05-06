"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Loader2, Check, AlertCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ClientRateLimiter } from "@/lib/client-rate-limiter"
import { StarRepoModal } from "@/components/star-repo-modal"
import { ApiKeySelect } from "@/components/api-key-select"
import { AddApiKeyModal } from "@/components/add-api-key-modal"
import { apiKeyStorage } from "@/lib/api-key-storage"
import { LanguageDropdown } from "@/components/language-dropdown"
import { PromptEditor } from "@/components/prompt-editor"
import { BeautifyJsonButton } from "@/components/beautify-json-button"

const SAMPLE_JSON = {
  homepage: {
    title: "Welcome to our website",
    subtitle: "Discover amazing products and services",
    cta: "Get Started Now",
    welcome_message: "Hello {username}, welcome back!",
  },
  navigation: {
    home: "Home",
    products: "Products",
    services: "Services",
    about: "About Us",
    contact: "Contact",
  },
  footer: {
    copyright: "© 2023 Example Company. All Rights Reserved.",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
  },
}

// Default translation prompt
const DEFAULT_TRANSLATION_PROMPT = `Translate this phrase or vocabulary: {text} to {targetLanguage} from {sourceLanguage}. 
Give me only the translation. If there's an equivalent phrase in {targetLanguage} language, provide that phrase. 
Be the best for UX writing and SEO writing: keep it short, natural, clear, and human-friendly. Prioritize meaning, 
tone, and context over literal translation.

IMPORTANT: Don't translate variables. Variables are defined like this: {word} these should be kept exactly like in the original text.

UX & SEO Writing Guidelines to follow:
1. Use clear, keyword-rich language.
2. Prioritize plain, natural tone—avoid robotic or overly formal phrasing.
3. Keep translations concise; remove unnecessary words.
4. Make content scannable and readable (especially for web/app UI).
5. If applicable, favor phrases that work well in headings or buttons.
6. Use terms that real users would actually search for or click on.
7. Maintain emotional tone and helpful intent (e.g., encouragement, clarity, action).
8. Preserve the tone and style of the original phrase—whether it's friendly, formal, playful, or serious.
9. Keep the **base meaning** of the original phrase intact—do not oversimplify or reinterpret.
10. NEVER translate text inside curly braces like {this} or {variable} - keep these exactly as they are.`

// Create a rate limiter instance
const rateLimiter = new ClientRateLimiter(15, 1500) // 15 RPM, 1500 RPD

export default function TranslationForm() {
  const [apiKey, setApiKey] = useState("")
  const [sourceLanguage, setSourceLanguage] = useState("en")
  const [targetLanguage, setTargetLanguage] = useState("es")
  const [jsonInput, setJsonInput] = useState(JSON.stringify(SAMPLE_JSON, null, 2))
  const [translatedJson, setTranslatedJson] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [progress, setProgress] = useState(0)
  const [totalKeys, setTotalKeys] = useState(0)
  const [completedKeys, setCompletedKeys] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const [isTranslationComplete, setIsTranslationComplete] = useState(false)
  const [currentTranslation, setCurrentTranslation] = useState<{ key: string; value: string } | null>(null)
  const [waitingForRateLimit, setWaitingForRateLimit] = useState(false)
  const [rateLimitInfo, setRateLimitInfo] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const originalJsonRef = useRef<any>(null)
  const translatedJsonRef = useRef<any>(null)
  const [showStarModal, setShowStarModal] = useState(false)
  const modalTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [showAddApiKeyModal, setShowAddApiKeyModal] = useState(false)
  // Add a refreshTrigger state to force ApiKeySelect to update
  const [apiKeyRefreshTrigger, setApiKeyRefreshTrigger] = useState(0)
  // Add state for custom translation prompt
  const [translationPrompt, setTranslationPrompt] = useState(DEFAULT_TRANSLATION_PROMPT)

  // Load saved API keys on mount
  useEffect(() => {
    const savedKeys = apiKeyStorage.getAll()
    if (savedKeys.length > 0) {
      setApiKey(savedKeys[0].value)
    }
  }, [])

  // Clean up abort controller and timer on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current)
      }
    }
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        // Validate JSON
        JSON.parse(content)
        setJsonInput(content)
      } catch (error) {
        setStatus({
          type: "error",
          message: "Invalid JSON file. Please upload a valid JSON file.",
        })
      }
    }
    reader.readAsText(file)
  }

  // Helper function to flatten JSON
  const flattenJson = (obj: any, prefix = "", result: Record<string, string> = {}): Record<string, string> => {
    if (obj === null || typeof obj !== "object") {
      return result
    }

    for (const [key, value] of Object.entries(obj)) {
      const newPrefix = prefix ? `${prefix}.${key}` : key

      if (typeof value === "string") {
        result[newPrefix] = value
      } else if (Array.isArray(value)) {
        // Handle arrays
        value.forEach((item, index) => {
          const arrayPrefix = `${newPrefix}[${index}]`
          if (typeof item === "string") {
            result[arrayPrefix] = item
          } else if (typeof item === "object" && item !== null) {
            flattenJson(item, arrayPrefix, result)
          }
        })
      } else if (typeof value === "object" && value !== null) {
        flattenJson(value, newPrefix, result)
      }
    }

    return result
  }

  // Helper function to update nested JSON with a translation
  const updateJsonWithTranslation = (json: any, path: string, value: string) => {
    try {
      // Handle array notation like "key[0]"
      if (path.includes("[")) {
        const parts = path.split(/\.|\[|\]/).filter(Boolean)
        let current = json

        // Navigate to the nested property
        for (let i = 0; i < parts.length - 2; i += 2) {
          const key = parts[i]
          const index = Number.parseInt(parts[i + 1], 10)

          if (!current[key]) current[key] = []
          if (!current[key][index]) current[key][index] = {}

          current = current[key][index]
        }

        // Set the value at the final key
        const lastKey = parts[parts.length - 2]
        const lastIndex = Number.parseInt(parts[parts.length - 1], 10)

        if (!current[lastKey]) current[lastKey] = []
        current[lastKey][lastIndex] = value
      } else {
        // Handle regular nested keys
        const parts = path.split(".")
        let current = json

        // Navigate to the nested property
        for (let i = 0; i < parts.length - 1; i++) {
          if (current[parts[i]] === undefined) current[parts[i]] = {}
          current = current[parts[i]]
        }

        // Set the value at the final key
        const lastPart = parts[parts.length - 1]
        current[lastPart] = value
      }
    } catch (error) {
      console.error(`Error updating JSON with translation for path ${path}:`, error)
    }
  }

  // Function to translate a single key with rate limiting and retries
  const translateKey = async (key: string, text: string, retryCount = 0): Promise<string> => {
    try {
      // Wait for rate limit before making the request
      setWaitingForRateLimit(true)
      setRateLimitInfo("Checking rate limits...")
      await rateLimiter.waitForRateLimit()
      setWaitingForRateLimit(false)
      setRateLimitInfo(null)

      // Create a prompt with the custom translation prompt
      const customizedPrompt = translationPrompt
        .replace("{text}", text)
        .replace("{sourceLanguage}", sourceLanguage)
        .replace("{targetLanguage}", targetLanguage)

      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          sourceLanguage,
          targetLanguage,
          apiKey,
          prompt: customizedPrompt, // Send the customized prompt
        }),
        signal: abortControllerRef.current?.signal,
      })

      // Record the request after it's made
      rateLimiter.recordRequest()

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If we can't parse the error, use the default message
        }

        // If we get a 429 (Too Many Requests) or 500 error, retry with exponential backoff
        if ((response.status === 429 || response.status === 500) && retryCount < 3) {
          const waitTime = Math.pow(2, retryCount) * 1000 // Exponential backoff: 1s, 2s, 4s
          setRateLimitInfo(`Rate limit exceeded. Retrying in ${waitTime / 1000} seconds...`)
          await new Promise((resolve) => setTimeout(resolve, waitTime))
          return translateKey(key, text, retryCount + 1)
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data.translation
    } catch (error) {
      console.error(`Error translating key ${key}:`, error)
      throw error
    } finally {
      setWaitingForRateLimit(false)
      setRateLimitInfo(null)
    }
  }

  const handleTranslate = async () => {
    // Reset previous results
    setTranslatedJson("")
    setStatus(null)
    setProgress(0)
    setCompletedKeys(0)
    setTotalKeys(0)
    setShowProgress(false)
    setIsTranslationComplete(false)
    setCurrentTranslation(null)
    setWaitingForRateLimit(false)
    setRateLimitInfo(null)
    setShowStarModal(false)

    // Clear any existing modal timer
    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current)
      modalTimerRef.current = null
    }

    // Set a timer to show the modal after 10 seconds
    modalTimerRef.current = setTimeout(() => {
      setShowStarModal(true)
    }, 10000) // 10 seconds

    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create a new abort controller
    abortControllerRef.current = new AbortController()

    // Validate inputs
    let jsonData
    try {
      jsonData = JSON.parse(jsonInput)
      originalJsonRef.current = jsonData
      translatedJsonRef.current = JSON.parse(JSON.stringify(jsonData))
    } catch (error) {
      // Clear the modal timer if validation fails
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current)
        modalTimerRef.current = null
      }

      setStatus({
        type: "error",
        message: "Invalid JSON input. Please check your JSON format.",
      })
      return
    }

    if (!apiKey) {
      // Clear the modal timer if validation fails
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current)
        modalTimerRef.current = null
      }

      setStatus({
        type: "error",
        message: "Gemini API key is required",
      })
      return
    }

    setIsLoading(true)
    setShowProgress(true)

    try {
      // Flatten the JSON to process keys one by one
      const flattenedJson = flattenJson(jsonData)
      const keys = Object.keys(flattenedJson)
      setTotalKeys(keys.length)

      // Process each key one by one
      let completed = 0
      let errorCount = 0
      const maxErrors = 3 // Maximum number of consecutive errors before giving up

      for (const key of keys) {
        const text = flattenedJson[key]

        try {
          // Skip if not a string or empty
          if (typeof text !== "string" || !text.trim()) {
            updateJsonWithTranslation(translatedJsonRef.current, key, text)
          } else {
            // Update current translation being processed
            setCurrentTranslation({
              key,
              value: "Translating...",
            })

            // Translate the text with rate limiting
            const translation = await translateKey(key, text)

            // Update the JSON with the translation
            updateJsonWithTranslation(translatedJsonRef.current, key, translation)

            // Update current translation display
            setCurrentTranslation({
              key,
              value: translation,
            })

            // Reset error count on success
            errorCount = 0
          }

          // Update progress
          completed++
          setCompletedKeys(completed)
          setProgress((completed / keys.length) * 100)

          // Update the displayed JSON
          setTranslatedJson(JSON.stringify(translatedJsonRef.current, null, 2))
        } catch (error: any) {
          console.error(`Translation error for key ${key}:`, error)

          // Use original text as fallback
          updateJsonWithTranslation(translatedJsonRef.current, key, text)

          // Update progress even on error
          completed++
          setCompletedKeys(completed)
          setProgress((completed / keys.length) * 100)

          // Update the displayed JSON
          setTranslatedJson(JSON.stringify(translatedJsonRef.current, null, 2))

          // Count consecutive errors
          errorCount++

          // If we hit too many consecutive errors, stop
          if (errorCount >= maxErrors) {
            throw new Error(`Too many consecutive errors (${maxErrors}). Last error: ${error.message}`)
          }
        }

        // Check if the operation was aborted
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error("Translation cancelled")
        }
      }

      // Translation is complete
      setIsTranslationComplete(true)
      setStatus({
        type: "success",
        message: "Translation completed successfully!",
      })

      // Note: We don't need to show the modal here anymore since it's on a timer
    } catch (error: any) {
      if (error.name !== "AbortError" && error.message !== "Translation cancelled") {
        console.error("Translation process error:", error)
        setStatus({
          type: "error",
          message: `Error: ${error.message || "Failed to translate"}`,
        })
      }
    } finally {
      setIsLoading(false)
      setWaitingForRateLimit(false)
      setRateLimitInfo(null)
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Clear the modal timer if translation is cancelled
    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current)
      modalTimerRef.current = null
    }

    setIsLoading(false)
    setWaitingForRateLimit(false)
    setRateLimitInfo(null)
    setStatus({
      type: "error",
      message: "Translation cancelled",
    })
  }

  const handleDownload = () => {
    if (!translatedJson) return

    const blob = new Blob([translatedJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `translated_${targetLanguage}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Update the handleApiKeyAdded function
  const handleApiKeyAdded = (keyId: string) => {
    const keys = apiKeyStorage.getAll()
    const newKey = keys.find((k) => k.id === keyId)
    if (newKey) {
      setApiKey(newKey.value)
      // Increment the refresh trigger to force a refresh of the ApiKeySelect component
      setApiKeyRefreshTrigger((prev) => prev + 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label htmlFor="apiKey" className="text-sm font-medium">
              Gemini API Key
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddApiKeyModal(true)}
              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add new API key</span>
            </Button>
          </div>
          <div className="mt-1">
            <ApiKeySelect
              value={apiKey}
              onChange={setApiKey}
              onAddNew={() => setShowAddApiKeyModal(true)}
              refreshTrigger={apiKeyRefreshTrigger}
            />
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center">
            <span>Get your API key from </span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 hover:underline ml-1 inline-flex items-center"
            >
              Google AI Studio
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-0.5"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <LanguageDropdown
            value={sourceLanguage}
            onChange={setSourceLanguage}
            label="Source Language"
            disabled={isLoading}
          />
          <LanguageDropdown
            value={targetLanguage}
            onChange={setTargetLanguage}
            label="Target Language"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Add the prompt editor */}
      <PromptEditor
        defaultPrompt={DEFAULT_TRANSLATION_PROMPT}
        onPromptChange={setTranslationPrompt}
        disabled={isLoading}
      />

      <div>
        <div className="flex justify-between items-center">
          <Label htmlFor="jsonInput" className="text-sm font-medium">
            JSON Input
          </Label>
          <div className="flex items-center gap-2">
            <BeautifyJsonButton jsonInput={jsonInput} onBeautify={setJsonInput} />
            <Label
              htmlFor="jsonFile"
              className={`text-xs text-emerald-600 hover:text-emerald-700 cursor-pointer ${
                isLoading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              Upload JSON file
            </Label>
            <Input
              id="jsonFile"
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isLoading}
            />
          </div>
        </div>
        <Textarea
          id="jsonInput"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="mt-1 font-mono text-sm h-64"
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-center gap-4">
        <Button
          onClick={handleTranslate}
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {waitingForRateLimit ? "Waiting for rate limit..." : "Translating..."}
            </>
          ) : (
            "Translate JSON"
          )}
        </Button>
        {isLoading && (
          <Button onClick={handleCancel} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
            Cancel
          </Button>
        )}
      </div>

      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Processing translation</span>
            <span>
              {completedKeys}/{totalKeys} keys ({Math.round(progress)}%)
            </span>
          </div>
          <Progress value={progress} className="h-2" />

          {rateLimitInfo && (
            <div className="bg-amber-50 p-2 rounded border border-amber-100 mt-2">
              <p className="text-xs text-amber-700 flex items-center">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                <span>{rateLimitInfo}</span>
              </p>
            </div>
          )}

          {currentTranslation && (
            <div className="bg-emerald-50 p-2 rounded border border-emerald-100 mt-2">
              <p className="text-xs text-emerald-700">
                <span className="font-semibold">Currently translating:</span> {currentTranslation.key}
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                <span className="font-semibold">Result:</span> {currentTranslation.value}
              </p>
            </div>
          )}
        </div>
      )}

      {status && (
        <Alert
          variant={status.type === "error" ? "destructive" : "default"}
          className={status.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : undefined}
        >
          {status.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}

      {translatedJson && (
        <Card className="mt-6 border-emerald-200 shadow-md">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                {isTranslationComplete ? (
                  <Check className="h-5 w-5 text-emerald-500 mr-2" />
                ) : (
                  <Loader2 className="h-5 w-5 text-amber-500 mr-2 animate-spin" />
                )}
                <Label htmlFor="jsonOutput" className="text-lg font-medium text-emerald-700">
                  {isTranslationComplete ? "Translated JSON" : "Live Translation"}
                </Label>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(translatedJson)
                    setStatus({
                      type: "success",
                      message: "Copied to clipboard!",
                    })
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy
                </Button>
                <Button onClick={handleDownload} className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download
                </Button>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
              <Textarea
                id="jsonOutput"
                value={translatedJson}
                readOnly
                className="mt-1 font-mono text-sm h-64 bg-white border-slate-200 focus:border-emerald-300 focus:ring-emerald-200"
              />
            </div>
            <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
              <span>
                {completedKeys}/{totalKeys} keys translated ({Math.round(progress)}%)
              </span>
              <span className="font-semibold">Target language: {targetLanguage}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Star Repository Modal */}
      <StarRepoModal isOpen={showStarModal} onClose={() => setShowStarModal(false)} />

      {/* Add API Key Modal */}
      <AddApiKeyModal
        isOpen={showAddApiKeyModal}
        onClose={() => setShowAddApiKeyModal(false)}
        onKeyAdded={handleApiKeyAdded}
      />
    </div>
  )
}
