"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Loader2, Check, AlertCircle, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ClientRateLimiter } from "@/lib/client-rate-limiter"
import { ApiKeySelect } from "@/components/api-key-select"
import { AddApiKeyModal } from "@/components/add-api-key-modal"
import { apiKeyStorage } from "@/lib/api-key-storage"
import { LanguageDropdown } from "@/components/language-dropdown"
import { PromptEditor } from "@/components/prompt-editor"

const SAMPLE_SOURCE_JSON = {
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
}

const SAMPLE_TRANSLATED_JSON = {
  homepage: {
    title: "Bienvenido a nuestro sitio web",
    subtitle:
      "Descubra productos y servicios increíbles que cambiarán su vida y le brindarán una experiencia excepcional",
    cta: "Comience ahora",
    welcome_message: "Hola {username}, ¡bienvenido de nuevo!",
  },
  navigation: {
    home: "Inicio",
    products: "Productos",
    services: "Servicios",
    about: "Acerca de nosotros",
    contact: "Contacto",
  },
}

// Default improvement prompt
const DEFAULT_IMPROVEMENT_PROMPT = `You are a translation optimizer. Your task is to improve the following translation by making it more concise while preserving the original meaning and tone.

Original text in {sourceLanguage}: {sourceText}
Current translation in {targetLanguage}: {translatedText}

The current translation is too long (more than 120% of the original text length). Please provide a more concise version that:
1. Preserves the core meaning and intent
2. Maintains the same tone and style
3. Removes unnecessary words or redundant phrases
4. Is natural and fluent in {targetLanguage}
5. Keeps any variables or placeholders exactly as they are (like {variable} or {name})

Provide ONLY the improved translation with no additional text, explanations, or notes.`

// Create a rate limiter instance
const rateLimiter = new ClientRateLimiter(15, 1500) // 15 RPM, 1500 RPD

export function ImproveJsonForm() {
  const [apiKey, setApiKey] = useState("")
  const [sourceLanguage, setSourceLanguage] = useState("en")
  const [targetLanguage, setTargetLanguage] = useState("es")
  const [sourceJsonInput, setSourceJsonInput] = useState(JSON.stringify(SAMPLE_SOURCE_JSON, null, 2))
  const [translatedJsonInput, setTranslatedJsonInput] = useState(JSON.stringify(SAMPLE_TRANSLATED_JSON, null, 2))
  const [improvedJson, setImprovedJson] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [progress, setProgress] = useState(0)
  const [totalKeys, setTotalKeys] = useState(0)
  const [completedKeys, setCompletedKeys] = useState(0)
  const [keysToImprove, setKeysToImprove] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const [isImprovementComplete, setIsImprovementComplete] = useState(false)
  const [currentImprovement, setCurrentImprovement] = useState<{ key: string; value: string; ratio: number } | null>(
    null,
  )
  const [waitingForRateLimit, setWaitingForRateLimit] = useState(false)
  const [rateLimitInfo, setRateLimitInfo] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const sourceJsonRef = useRef<any>(null)
  const translatedJsonRef = useRef<any>(null)
  const improvedJsonRef = useRef<any>(null)
  const [showAddApiKeyModal, setShowAddApiKeyModal] = useState(false)
  const [apiKeyRefreshTrigger, setApiKeyRefreshTrigger] = useState(0)
  const [improvementPrompt, setImprovementPrompt] = useState(DEFAULT_IMPROVEMENT_PROMPT)
  const [lengthThreshold, setLengthThreshold] = useState(120)

  // Load saved API keys on mount
  useEffect(() => {
    const savedKeys = apiKeyStorage.getAll()
    if (savedKeys.length > 0) {
      setApiKey(savedKeys[0].value)
    }
  }, [])

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleSourceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        // Validate JSON
        JSON.parse(content)
        setSourceJsonInput(content)
      } catch (error) {
        setStatus({
          type: "error",
          message: "Invalid JSON file. Please upload a valid JSON file.",
        })
      }
    }
    reader.readAsText(file)
  }

  const handleTranslatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        // Validate JSON
        JSON.parse(content)
        setTranslatedJsonInput(content)
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

  // Helper function to update nested JSON with an improved translation
  const updateJsonWithImprovement = (json: any, path: string, value: string) => {
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
      console.error(`Error updating JSON with improvement for path ${path}:`, error)
    }
  }

  // Function to improve a single translation with rate limiting and retries
  const improveTranslation = async (
    key: string,
    sourceText: string,
    translatedText: string,
    retryCount = 0,
  ): Promise<string> => {
    try {
      // Wait for rate limit before making the request
      setWaitingForRateLimit(true)
      setRateLimitInfo("Checking rate limits...")
      await rateLimiter.waitForRateLimit()
      setWaitingForRateLimit(false)
      setRateLimitInfo(null)

      // Create a prompt with the custom improvement prompt
      const customizedPrompt = improvementPrompt
        .replace("{sourceText}", sourceText)
        .replace("{translatedText}", translatedText)
        .replace("{sourceLanguage}", sourceLanguage)
        .replace("{targetLanguage}", targetLanguage)

      const response = await fetch("/api/improve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceText,
          translatedText,
          sourceLanguage,
          targetLanguage,
          apiKey,
          prompt: customizedPrompt,
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
          return improveTranslation(key, sourceText, translatedText, retryCount + 1)
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data.improvedTranslation
    } catch (error) {
      console.error(`Error improving translation for key ${key}:`, error)
      throw error
    } finally {
      setWaitingForRateLimit(false)
      setRateLimitInfo(null)
    }
  }

  const handleImprove = async () => {
    // Reset previous results
    setImprovedJson("")
    setStatus(null)
    setProgress(0)
    setCompletedKeys(0)
    setTotalKeys(0)
    setKeysToImprove(0)
    setShowProgress(false)
    setIsImprovementComplete(false)
    setCurrentImprovement(null)
    setWaitingForRateLimit(false)
    setRateLimitInfo(null)

    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create a new abort controller
    abortControllerRef.current = new AbortController()

    // Validate inputs
    let sourceJson, translatedJson
    try {
      sourceJson = JSON.parse(sourceJsonInput)
      translatedJson = JSON.parse(translatedJsonInput)
      sourceJsonRef.current = sourceJson
      translatedJsonRef.current = translatedJson
      improvedJsonRef.current = JSON.parse(JSON.stringify(translatedJson)) // Start with a copy of the translated JSON
    } catch (error) {
      setStatus({
        type: "error",
        message: "Invalid JSON input. Please check your JSON format.",
      })
      return
    }

    if (!apiKey) {
      setStatus({
        type: "error",
        message: "Gemini API key is required",
      })
      return
    }

    setIsLoading(true)
    setShowProgress(true)

    try {
      // Flatten both JSONs to process keys one by one
      const flattenedSourceJson = flattenJson(sourceJson)
      const flattenedTranslatedJson = flattenJson(translatedJson)

      // Find keys that exist in both JSONs and where the translated text is significantly longer
      const keysToProcess = Object.keys(flattenedSourceJson).filter((key) => {
        const sourceText = flattenedSourceJson[key]
        const translatedText = flattenedTranslatedJson[key]

        // Skip if not a string or empty or not present in both JSONs
        if (
          typeof sourceText !== "string" ||
          !sourceText.trim() ||
          typeof translatedText !== "string" ||
          !translatedText.trim()
        ) {
          return false
        }

        // Check if the translated text is more than the threshold % longer than the source
        const lengthRatio = (translatedText.length / sourceText.length) * 100
        return lengthRatio > lengthThreshold
      })

      setTotalKeys(Object.keys(flattenedSourceJson).length)
      setKeysToImprove(keysToProcess.length)

      // If no keys need improvement, we're done
      if (keysToProcess.length === 0) {
        setImprovedJson(JSON.stringify(translatedJson, null, 2))
        setIsImprovementComplete(true)
        setStatus({
          type: "success",
          message: "No translations need improvement! All translations are already concise.",
        })
        setIsLoading(false)
        return
      }

      // Process each key that needs improvement
      let completed = 0
      let errorCount = 0
      const maxErrors = 3 // Maximum number of consecutive errors before giving up

      for (const key of Object.keys(flattenedSourceJson)) {
        const sourceText = flattenedSourceJson[key]
        const translatedText = flattenedTranslatedJson[key]

        try {
          // Skip if not a string or empty or not present in both JSONs
          if (
            typeof sourceText !== "string" ||
            !sourceText.trim() ||
            typeof translatedText !== "string" ||
            !translatedText.trim()
          ) {
            // Just copy the original translation
            updateJsonWithImprovement(improvedJsonRef.current, key, translatedText || sourceText || "")
          } else {
            // Calculate length ratio
            const lengthRatio = (translatedText.length / sourceText.length) * 100

            // Only improve if the translation is too long
            if (lengthRatio > lengthThreshold) {
              // Update current improvement being processed
              setCurrentImprovement({
                key,
                value: "Improving...",
                ratio: lengthRatio,
              })

              // Improve the translation
              const improvedTranslation = await improveTranslation(key, sourceText, translatedText)

              // Update the JSON with the improved translation
              updateJsonWithImprovement(improvedJsonRef.current, key, improvedTranslation)

              // Update current improvement display
              setCurrentImprovement({
                key,
                value: improvedTranslation,
                ratio: lengthRatio,
              })

              // Reset error count on success
              errorCount = 0
            } else {
              // Keep the original translation if it's not too long
              updateJsonWithImprovement(improvedJsonRef.current, key, translatedText)
            }
          }

          // Update progress
          completed++
          setCompletedKeys(completed)
          setProgress((completed / Object.keys(flattenedSourceJson).length) * 100)

          // Update the displayed JSON
          setImprovedJson(JSON.stringify(improvedJsonRef.current, null, 2))
        } catch (error: any) {
          console.error(`Improvement error for key ${key}:`, error)

          // Use original translation as fallback
          updateJsonWithImprovement(improvedJsonRef.current, key, translatedText || sourceText || "")

          // Update progress even on error
          completed++
          setCompletedKeys(completed)
          setProgress((completed / Object.keys(flattenedSourceJson).length) * 100)

          // Update the displayed JSON
          setImprovedJson(JSON.stringify(improvedJsonRef.current, null, 2))

          // Count consecutive errors
          errorCount++

          // If we hit too many consecutive errors, stop
          if (errorCount >= maxErrors) {
            throw new Error(`Too many consecutive errors (${maxErrors}). Last error: ${error.message}`)
          }
        }

        // Check if the operation was aborted
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error("Improvement cancelled")
        }
      }

      // Improvement is complete
      setIsImprovementComplete(true)
      setStatus({
        type: "success",
        message: `Improvement completed successfully! Optimized ${keysToProcess.length} translations.`,
      })
    } catch (error: any) {
      if (error.name !== "AbortError" && error.message !== "Improvement cancelled") {
        console.error("Improvement process error:", error)
        setStatus({
          type: "error",
          message: `Error: ${error.message || "Failed to improve translations"}`,
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

    setIsLoading(false)
    setWaitingForRateLimit(false)
    setRateLimitInfo(null)
    setStatus({
      type: "error",
      message: "Improvement cancelled",
    })
  }

  const handleDownload = () => {
    if (!improvedJson) return

    const blob = new Blob([improvedJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `improved_${targetLanguage}.json`
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
              className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
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
              className="text-purple-600 hover:text-purple-700 hover:underline ml-1 inline-flex items-center"
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

      {/* Length threshold slider */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="flex justify-between items-center mb-2">
          <Label htmlFor="lengthThreshold" className="text-sm font-medium">
            Length Threshold (%)
          </Label>
          <span className="text-sm font-medium text-purple-600">{lengthThreshold}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">100%</span>
          <input
            id="lengthThreshold"
            type="range"
            min="100"
            max="200"
            step="5"
            value={lengthThreshold}
            onChange={(e) => setLengthThreshold(Number.parseInt(e.target.value))}
            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            disabled={isLoading}
          />
          <span className="text-xs text-slate-500">200%</span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Translations longer than {lengthThreshold}% of the source text will be improved for conciseness.
        </p>
      </div>

      {/* Add the prompt editor */}
      <PromptEditor
        defaultPrompt={DEFAULT_IMPROVEMENT_PROMPT}
        onPromptChange={setImprovementPrompt}
        disabled={isLoading}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="sourceJsonInput" className="text-sm font-medium">
              Source JSON (Original)
            </Label>
            <div>
              <Label
                htmlFor="sourceJsonFile"
                className={`text-xs text-purple-600 hover:text-purple-700 cursor-pointer ${
                  isLoading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                Upload JSON file
              </Label>
              <Input
                id="sourceJsonFile"
                type="file"
                accept=".json"
                onChange={handleSourceFileUpload}
                className="hidden"
                disabled={isLoading}
              />
            </div>
          </div>
          <Textarea
            id="sourceJsonInput"
            value={sourceJsonInput}
            onChange={(e) => setSourceJsonInput(e.target.value)}
            className="mt-1 font-mono text-sm h-64"
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="translatedJsonInput" className="text-sm font-medium">
              Translated JSON
            </Label>
            <div>
              <Label
                htmlFor="translatedJsonFile"
                className={`text-xs text-purple-600 hover:text-purple-700 cursor-pointer ${
                  isLoading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                Upload JSON file
              </Label>
              <Input
                id="translatedJsonFile"
                type="file"
                accept=".json"
                onChange={handleTranslatedFileUpload}
                className="hidden"
                disabled={isLoading}
              />
            </div>
          </div>
          <Textarea
            id="translatedJsonInput"
            value={translatedJsonInput}
            onChange={(e) => setTranslatedJsonInput(e.target.value)}
            className="mt-1 font-mono text-sm h-64"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button onClick={handleImprove} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {waitingForRateLimit ? "Waiting for rate limit..." : "Improving..."}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Improve Translations
            </>
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
            <span>Processing improvements</span>
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

          {currentImprovement && (
            <div className="bg-purple-50 p-2 rounded border border-purple-100 mt-2">
              <p className="text-xs text-purple-700">
                <span className="font-semibold">Currently improving:</span> {currentImprovement.key}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                <span className="font-semibold">Length ratio:</span> {Math.round(currentImprovement.ratio)}% of source
              </p>
              <p className="text-xs text-purple-600 mt-1">
                <span className="font-semibold">Result:</span> {currentImprovement.value}
              </p>
            </div>
          )}
        </div>
      )}

      {status && (
        <Alert
          variant={status.type === "error" ? "destructive" : "default"}
          className={status.type === "success" ? "bg-purple-50 text-purple-800 border-purple-200" : undefined}
        >
          {status.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}

      {improvedJson && (
        <Card className="mt-6 border-purple-200 shadow-md">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                {isImprovementComplete ? (
                  <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
                ) : (
                  <Loader2 className="h-5 w-5 text-amber-500 mr-2 animate-spin" />
                )}
                <Label htmlFor="jsonOutput" className="text-lg font-medium text-purple-700">
                  {isImprovementComplete ? "Improved JSON" : "Improving Translations..."}
                </Label>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(improvedJson)
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
                <Button onClick={handleDownload} className="bg-purple-600 hover:bg-purple-700 text-white" size="sm">
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
                value={improvedJson}
                readOnly
                className="mt-1 font-mono text-sm h-64 bg-white border-slate-200 focus:border-purple-300 focus:ring-purple-200"
              />
            </div>
            <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
              <span>
                {completedKeys}/{totalKeys} keys processed ({Math.round(progress)}%)
              </span>
              <span className="font-medium text-purple-600">{keysToImprove} translations improved for conciseness</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add API Key Modal */}
      <AddApiKeyModal
        isOpen={showAddApiKeyModal}
        onClose={() => setShowAddApiKeyModal(false)}
        onKeyAdded={handleApiKeyAdded}
      />
    </div>
  )
}
