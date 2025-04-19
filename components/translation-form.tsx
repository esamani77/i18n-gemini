"use client"

import type React from "react"

import { useState } from "react"
import { Loader2, Check, AlertCircle } from "lucide-react"
import axios from "axios"
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
  const [showProgress, setShowProgress] = useState(false)
  const [pollingId, setPollingId] = useState<NodeJS.Timeout | null>(null)

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
    setShowProgress(false)

    // Validate inputs
    let jsonData
    try {
      jsonData = JSON.parse(jsonInput)
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
      // Start a progress simulation for better UX
      startProgressSimulation()

      // Make the API request to our Next.js API route
      const response = await axios.post(
        "/api/translate",
        {
          jsonData,
          sourceLanguage,
          targetLanguage,
          apiKey,
        },
        {
          // Set a long timeout for large translations
          timeout: 3600000, // 1 hour
        },
      )

      // Stop the progress simulation
      stopProgressSimulation()
      setProgress(100)

      setTranslatedJson(JSON.stringify(response.data.translatedData, null, 2))
      setStatus({
        type: "success",
        message: "Translation completed successfully!",
      })
    } catch (error: any) {
      stopProgressSimulation()
      console.error("Translation error:", error)
      setStatus({
        type: "error",
        message: `Error: ${error.response?.data?.error || error.message || "Failed to translate"}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startProgressSimulation = () => {
    // Simulate progress for better UX during long-running translations
    setProgress(0)
    const id = setInterval(() => {
      setProgress((prevProgress) => {
        // Slowly increase progress, but never reach 100% until complete
        if (prevProgress < 90) {
          const increment = Math.random() * 2 + 0.5
          return Math.min(prevProgress + increment, 90)
        }
        return prevProgress
      })
    }, 3000)
    setPollingId(id)
  }

  const stopProgressSimulation = () => {
    if (pollingId) {
      clearInterval(pollingId)
      setPollingId(null)
    }
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

      <div className="flex justify-center">
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
      </div>

      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Processing translation</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-slate-500 text-center">
            Large translations may take several minutes. Please don't close this window.
          </p>
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
                <Check className="h-5 w-5 text-emerald-500 mr-2" />
                <Label htmlFor="jsonOutput" className="text-lg font-medium text-emerald-700">
                  Translated JSON
                </Label>
              </div>
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
                Download JSON
              </Button>
            </div>
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
              <Textarea
                id="jsonOutput"
                value={translatedJson}
                readOnly
                className="font-mono text-sm h-64 bg-white border-slate-200 focus:border-emerald-300 focus:ring-emerald-200"
              />
            </div>
            <div className="mt-3 text-xs text-slate-500 flex items-center justify-end">
              <span>Target language: </span>
              <span className="font-semibold ml-1">
                {LANGUAGES.find((lang) => lang.code === targetLanguage)?.name || targetLanguage}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
