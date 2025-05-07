"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Loader2, Check, AlertCircle, Plus, FileText } from "lucide-react"
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
import { useTranslations } from "next-intl";
const SAMPLE_ARTICLE = `# The Future of Artificial Intelligence

Artificial Intelligence (AI) has made significant strides in recent years, transforming various industries and aspects of daily life. From healthcare to finance, AI-powered solutions are enhancing efficiency, accuracy, and decision-making processes.

## Current Applications

AI is currently being used in numerous fields:

- **Healthcare**: Diagnosing diseases, drug discovery, and personalized medicine
- **Finance**: Fraud detection, algorithmic trading, and risk assessment
- **Transportation**: Self-driving vehicles and traffic optimization
- **Customer Service**: Chatbots and virtual assistants
- **Manufacturing**: Quality control and predictive maintenance

## Challenges and Concerns

Despite its potential benefits, AI also raises important concerns:

1. **Ethics and Bias**: AI systems can perpetuate or amplify existing biases
2. **Privacy**: The collection and use of vast amounts of data raises privacy concerns
3. **Job Displacement**: Automation may lead to job losses in certain sectors
4. **Security**: AI systems can be vulnerable to attacks or manipulation
5. **Regulation**: The need for appropriate governance frameworks

## The Road Ahead

The future of AI will likely involve more sophisticated systems with greater autonomy and capability. Researchers are working on developing AI that can better understand context, demonstrate common sense reasoning, and explain its decision-making processes.

As AI continues to evolve, collaboration between technologists, policymakers, ethicists, and the public will be essential to ensure that these powerful tools are developed and deployed responsibly, for the benefit of humanity.`

// Default translation prompt
const DEFAULT_ARTICLE_PROMPT = `Translate the following article from {sourceLanguage} to {targetLanguage}. 
Maintain the original formatting, including headings, bullet points, numbered lists, and paragraph breaks.
Preserve the tone, style, and meaning of the original text.
Ensure that technical terms are translated accurately.
If there are any untranslatable terms or proper nouns, keep them in their original form.

Article to translate:
{text}

Please provide ONLY the translated article with the same formatting as the original.`

// Create a rate limiter instance
const rateLimiter = new ClientRateLimiter(15, 1500) // 15 RPM, 1500 RPD

export function ArticleTranslationForm() {
  const t = useTranslations("translate-article");
  const [apiKey, setApiKey] = useState("")
  const [sourceLanguage, setSourceLanguage] = useState("en")
  const [targetLanguage, setTargetLanguage] = useState("es")
  const [articleInput, setArticleInput] = useState(SAMPLE_ARTICLE)
  const [translatedArticle, setTranslatedArticle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [progress, setProgress] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const [isTranslationComplete, setIsTranslationComplete] = useState(false)
  const [waitingForRateLimit, setWaitingForRateLimit] = useState(false)
  const [rateLimitInfo, setRateLimitInfo] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [showAddApiKeyModal, setShowAddApiKeyModal] = useState(false)
  const [apiKeyRefreshTrigger, setApiKeyRefreshTrigger] = useState(0)
  const [translationPrompt, setTranslationPrompt] = useState(DEFAULT_ARTICLE_PROMPT)

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        setArticleInput(content)
      } catch (error) {
        setStatus({
          type: "error",
          message: t("error_reading_file"),
        })
      }
    }
    reader.readAsText(file)
  }

  // Function to translate the article with rate limiting and retries
  const translateArticle = async (text: string, retryCount = 0): Promise<string> => {
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

      const response = await fetch("/api/translate-article", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
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
          return translateArticle(text, retryCount + 1)
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data.translation
    } catch (error) {
      console.error(`Error translating article:`, error)
      throw error
    } finally {
      setWaitingForRateLimit(false)
      setRateLimitInfo(null)
    }
  }

  const handleTranslate = async () => {
    // Reset previous results
    setTranslatedArticle("")
    setStatus(null)
    setProgress(0)
    setShowProgress(false)
    setIsTranslationComplete(false)
    setWaitingForRateLimit(false)
    setRateLimitInfo(null)

    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create a new abort controller
    abortControllerRef.current = new AbortController()

    // Validate inputs
    if (!articleInput.trim()) {
      setStatus({
        type: "error",
        message: t("please_enter_text_to_translate"),
      })
      return
    }

    if (!apiKey) {
      setStatus({
        type: "error",
        message: t("gemini_api_key_required"),
      })
      return
    }

    setIsLoading(true)
    setShowProgress(true)

    try {
      // Start progress animation
      setProgress(10) // Initial progress to show something is happening

      // For longer articles, we might need to split them into chunks
      // But for now, we'll translate the entire article at once
      const translation = await translateArticle(articleInput)

      // Update progress
      setProgress(100)

      // Update the displayed translation
      setTranslatedArticle(translation)

      // Translation is complete
      setIsTranslationComplete(true)
      setStatus({
        type: "success",
        message: t("translation_completed_successfully"),
      })
    } catch (error: any) {
      if (error.name !== "AbortError" && error.message !== "Translation cancelled") {
        console.error("Translation process error:", error)
        setStatus({
          type: "error",
          message: t("error_translating"),
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
      message: t("translation_cancelled"),
    })
  }

  const handleDownload = () => {
    if (!translatedArticle) return

    const blob = new Blob([translatedArticle], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `translated_article_${targetLanguage}.txt`
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
              {t("gemini_api_key")}
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddApiKeyModal(true)}
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">{t("add_new_api_key")}</span>
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
            <span>{t("get_api_key_from")}</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline ml-1 inline-flex items-center"
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
      <PromptEditor defaultPrompt={DEFAULT_ARTICLE_PROMPT} onPromptChange={setTranslationPrompt} disabled={isLoading} />

      <div>
        <div className="flex justify-between items-center">
          <Label htmlFor="articleInput" className="text-sm font-medium">
            {t("article_text")}
          </Label>
          <div>
            <Label
              htmlFor="articleFile"
              className={`text-xs text-blue-600 hover:text-blue-700 cursor-pointer ${
                isLoading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {t("upload_text_file")}
            </Label>
            <Input
              id="articleFile"
              type="file"
              accept=".txt,.md,.html"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isLoading}
            />
          </div>
        </div>
        <Textarea
          id="articleInput"
          value={articleInput}
          onChange={(e) => setArticleInput(e.target.value)}
          className="mt-1 font-mono text-sm h-64"
          disabled={isLoading}
          placeholder={t("enter_article_text_here")}
        />
      </div>

      <div className="flex justify-center gap-4">
        <Button onClick={handleTranslate} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {waitingForRateLimit ? t("waiting_for_rate_limit") : t("translating")}
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              {t("translate_article")}
            </>
          )}
        </Button>
        {isLoading && (
          <Button onClick={handleCancel} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
            {t("cancel")}
          </Button>
        )}
      </div>

      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-500">
            <span>{t("processing_translation")}</span>
            <span>{Math.round(progress)}%</span>
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
        </div>
      )}

      {status && (
        <Alert
          variant={status.type === "error" ? "destructive" : "default"}
          className={status.type === "success" ? "bg-blue-50 text-blue-800 border-blue-200" : undefined}
        >
          {status.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}

      {translatedArticle && (
        <Card className="mt-6 border-blue-200 shadow-md">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                {isTranslationComplete ? (
                  <Check className="h-5 w-5 text-blue-500 mr-2" />
                ) : (
                  <Loader2 className="h-5 w-5 text-amber-500 mr-2 animate-spin" />
                )}
                <Label htmlFor="articleOutput" className="text-lg font-medium text-blue-700">
                  {isTranslationComplete ? "Translated Article" : "Translating..."}
                </Label>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(translatedArticle)
                    setStatus({
                      type: "success",
                      message: t("copied_to_clipboard"),
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
                  {t("copy")}
                </Button>
                <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
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
                  {t("download")}
                </Button>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
              <Textarea
                id="articleOutput"
                value={translatedArticle}
                readOnly
                className="mt-1 font-mono text-sm h-64 bg-white border-slate-200 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>
            <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
              <span>{t("translation_complete")}</span>
              <span className="font-semibold">{t("target_language")}: {targetLanguage}</span>
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
