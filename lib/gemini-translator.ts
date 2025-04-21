import axios, { type AxiosInstance } from "axios"

interface TranslationOptions {
  query: string
  target: string
  source: string
}

export class GeminiTranslator {
  private apiKey: string
  private instance: AxiosInstance

  constructor(apiKey: string) {
    this.apiKey = apiKey
    if (!this.apiKey) {
      throw new Error("Gemini API key is not set")
    }

    this.instance = axios.create({
      baseURL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 30000, // 30 seconds timeout
    })
  }

  // Helper to estimate token count based on text length
  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4)
  }

  async translate({ query, target, source }: TranslationOptions): Promise<string> {
    try {
      const prompt = `Translate this phrase or vocabulary: ${query} to ${target} from ${source}. 
Give me only the translation. If there's an equivalent phrase in ${target} language, provide that phrase. 
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
10. NEVER translate text inside curly braces like {this} or {variable} - keep these exactly as they are.
`
      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))

      const response = await this.instance.post("", {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      })

      const translation = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

      if (!translation) {
        throw new Error("No translation received")
      }

      return translation
    } catch (error: any) {
      console.error("Translation error:", error.message || error)
      if (error.response) {
        console.error("Response data:", error.response.data)
        console.error("Response status:", error.response.status)
      }
      throw new Error(`Translation failed: ${error.message || "Unknown error"}`)
    }
  }
}
