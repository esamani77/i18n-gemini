"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Loader2, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

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

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ru", name: "Russian" },
  { code: "ar", name: "Arabic" },
  { code: "fa", name: "Persian" },
]

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
  const [isStreamingComplete, setIsStreamingComplete] = useState(false)
  const [currentTranslation, setCurrentTranslation] = useState<{ key: string; value: string } | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const originalJsonRef = useRef<any>(null)
  const partialResultRef = useRef<any>(null)

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
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

  const handleTranslate = async () => {
    // Reset previous results
    setTranslatedJson("")
    setStatus(null)
    setProgress(0)
    setCompletedKeys(0)
    setTotalKeys(0)
    setShowProgress(false)
    setIsStreamingComplete(false)
    setCurrentTranslation(null)
    partialResultRef.current = null

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
      originalJsonRef.current = jsonData // Store the original JSON structure
      partialResultRef.current = JSON.parse(JSON.stringify(jsonData)) // Create a copy for partial results
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
      // Create a POST request with the JSON data
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonData,
          sourceLanguage,
          targetLanguage,
          apiKey,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`HTTP error! status: ${response.status}${errorData.error ? ` - ${errorData.error}` : ""}`)
      }

      // Set up the EventSource for SSE
      const eventSource = new EventSource("/api/translate")

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleStreamMessage(data)
        } catch (e) {
          console.error("Error parsing SSE message:", e)
        }
      }

      eventSource.onerror = (error) => {
        console.error("EventSource error:", error)
        eventSource.close()
        setIsLoading(false)
        setStatus({
          type: "error",
          message: "Connection error. Please try again.",
        })
      }

      // Store the EventSource for cleanup
      const controller = abortControllerRef.current
      controller.signal.addEventListener("abort", () => {
        eventSource.close()
      })
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Translation error:", error)
        setStatus({
          type: "error",
          message: `Error: ${error.message || "Failed to translate"}`,
        })
        setIsLoading(false)
      }
    }
  }

  const handleStreamMessage = (data: any) => {
    switch (data.type) {
      case "init":
        // Initialize with total keys
        setTotalKeys(data.totalKeys)
        break

      case "progress":
        // Update progress
        setCompletedKeys(data.progress.completed)
        setTotalKeys(data.progress.total)
        setProgress((data.progress.completed / data.progress.total) * 100)

        // Update current translation being processed
        setCurrentTranslation({
          key: data.key,
          value: data.translation,
        })

        // Update partial result
        if (partialResultRef.current && data.key) {
          // Update the JSON structure with this translation
          updateJsonWithTranslation(partialResultRef.current, data.key, data.translation)

          // Update the displayed JSON
          setTranslatedJson(JSON.stringify(partialResultRef.current, null, 2))
        }
        break

      case "complete":
        // Translation is complete
        setTranslatedJson(JSON.stringify(data.translatedData, null, 2))
        setProgress(100)
        setIsLoading(false)
        setIsStreamingComplete(true)
        setStatus({
          type: "success",
          message: "Translation completed successfully!",
        })
        break

      case "error":
        // Handle error
        setStatus({
          type: "error",
          message: `Error: ${data.error}`,
        })
        setIsLoading(false)
        break
    }
  }

  // Helper function to update nested JSON with a translation
  const updateJsonWithTranslation = (json: any, path: string, value: string) => {
    const parts = path.split(".")
    let current = json

    // Navigate to the nested property
    for (let i = 0; i < parts.length - 1; i++) {
      // Handle array notation like "key[0]"
      const arrayMatch = parts[i].match(/^(.*)\[(\d+)\]$/)

      if (arrayMatch) {
        const [_, key, index] = arrayMatch
        if (!current[key]) current[key] = []
        if (!current[key][Number.parseInt(index)]) current[key][Number.parseInt(index)] = {}
        current = current[key][Number.parseInt(index)]
      } else {
        if (!current[parts[i]]) current[parts[i]] = {}
        current = current[parts[i]]
      }
    }

    // Set the value at the final key
    const lastPart = parts[parts.length - 1]
    const arrayMatch = lastPart.match(/^(.*)\[(\d+)\]$/)

    if (arrayMatch) {
      const [_, key, index] = arrayMatch
      if (!current[key]) current[key] = []
      current[key][Number.parseInt(index)] = value
    } else {
      current[lastPart] = value
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsLoading(false)
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="apiKey" className="text-sm font-medium">
            Gemini API Key
          </Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Enter your Gemini API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mt-1"
          />
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
          <div>
            <Label htmlFor="sourceLanguage" className="text-sm font-medium">
              Source Language
            </Label>
            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
              <SelectTrigger id="sourceLanguage" className="mt-1">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={`source-${lang.code}`} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="targetLanguage" className="text-sm font-medium">
              Target Language
            </Label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger id="targetLanguage" className="mt-1">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={`target-${lang.code}`} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center">
          <Label htmlFor="jsonInput" className="text-sm font-medium">
            JSON Input
          </Label>
          <div>
            <Label htmlFor="jsonFile" className="text-xs text-emerald-600 hover:text-emerald-700 cursor-pointer">
              Upload JSON file
            </Label>
            <Input id="jsonFile" type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </div>
        </div>
        <Textarea
          id="jsonInput"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="mt-1 font-mono text-sm h-64"
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
              Translating...
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
                {isStreamingComplete ? (
                  <Check className="h-5 w-5 text-emerald-500 mr-2" />
                ) : (
                  <Loader2 className="h-5 w-5 text-amber-500 mr-2 animate-spin" />
                )}
                <Label htmlFor="jsonOutput" className="text-lg font-medium text-emerald-700">
                  {isStreamingComplete ? "Translated JSON" : "Live Translation"}
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
                className="font-mono text-sm h-64 bg-white border-slate-200 focus:border-emerald-300 focus:ring-emerald-200"
              />
            </div>
            <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
              <span>
                {completedKeys}/{totalKeys} keys translated ({Math.round(progress)}%)
              </span>
              <span className="font-semibold">
                Target language: {LANGUAGES.find((lang) => lang.code === targetLanguage)?.name || targetLanguage}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
