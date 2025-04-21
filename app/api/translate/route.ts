import type { NextRequest } from "next/server"
import axios from "axios"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { text, targetLanguage, sourceLanguage = "en", apiKey } = body

    // Validate required fields
    if (!text) {
      return Response.json({ error: "Missing text to translate" }, { status: 400 })
    }
    if (!targetLanguage) {
      return Response.json({ error: "Missing target language" }, { status: 400 })
    }
    if (!apiKey) {
      return Response.json({ error: "Missing API key" }, { status: 400 })
    }

    // Skip translation if text is empty
    if (!text.trim()) {
      return Response.json({ translation: text })
    }

    // Create the prompt for translation
    const prompt = `Translate this phrase or vocabulary: ${text} to ${targetLanguage} from ${sourceLanguage}. 
Give me only the translation. If there's an equivalent phrase in ${targetLanguage} language, provide that phrase. 
Be the best for UX writing and SEO writing: keep it short, natural, clear, and human-friendly. Prioritize meaning, 
tone, and context over literal translation.

IMPORTANT: Don't translate variables. Variables are defined like this: {word} these should be kept exactly like in the original text.`

    // Make the API request to Gemini
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
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

    // Extract the translation from the response
    const translation = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!translation) {
      return Response.json({ error: "No translation received from API" }, { status: 500 })
    }

    // Return the translation
    return Response.json({ translation })
  } catch (error: any) {
    console.error("Translation API error:", error)

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
      return Response.json({ error: "No response received from translation API" }, { status: 500 })
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
