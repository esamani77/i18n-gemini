import type { NextRequest } from "next/server"
import axios from "axios"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { sourceText, translatedText, targetLanguage, sourceLanguage = "en", apiKey, prompt } = body

    // Validate required fields
    if (!sourceText) {
      return Response.json({ error: "Missing source text" }, { status: 400 })
    }
    if (!translatedText) {
      return Response.json({ error: "Missing translated text" }, { status: 400 })
    }
    if (!targetLanguage) {
      return Response.json({ error: "Missing target language" }, { status: 400 })
    }
    if (!apiKey) {
      return Response.json({ error: "Missing API key" }, { status: 400 })
    }

    // Skip improvement if text is empty
    if (!translatedText.trim()) {
      return Response.json({ improvedTranslation: translatedText })
    }

    // Use the provided prompt or fall back to a default
    const improvementPrompt =
      prompt ||
      `You are a translation optimizer. Your task is to improve the following translation by making it more concise while preserving the original meaning and tone.

Original text in ${sourceLanguage}: "${sourceText}"
Current translation in ${targetLanguage}: "${translatedText}"

The current translation is too long (more than 120% of the original text length). Please provide a more concise version that:
1. Preserves the core meaning and intent
2. Maintains the same tone and style
3. Removes unnecessary words or redundant phrases
4. Is natural and fluent in ${targetLanguage}
5. Keeps any variables or placeholders exactly as they are (like {variable} or {name})

Provide ONLY the improved translation with no additional text, explanations, or notes.`

    // Make the API request to Gemini
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: improvementPrompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 seconds timeout
      },
    )

    // Extract the improved translation from the response
    const improvedTranslation = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!improvedTranslation) {
      return Response.json({ error: "No improved translation received from API" }, { status: 500 })
    }

    // Return the improved translation
    return Response.json({ improvedTranslation })
  } catch (error: any) {
    console.error("Translation improvement API error:", error)

    // Handle Axios errors specifically
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response data:", error.response.data)
      console.error("Response status:", error.response.status)
      return Response.json(
        {
          error: `API error: ${error.response.status}`,
          details: error.response.data,
        },
        { status: 500 },
      )
    } else if (error.request) {
      // The request was made but no response was received
      return Response.json({ error: "No response received from API" }, { status: 500 })
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
