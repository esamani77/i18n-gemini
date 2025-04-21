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

    // Create the prompt for translation with clearer instructions
    const prompt = `Translate this text from ${sourceLanguage} to ${targetLanguage}: "${text}"

IMPORTANT INSTRUCTIONS:
1. Provide ONLY the direct translation with no additional text, explanations, or notes
2. Maintain all formatting, including any HTML tags
3. DO NOT add any variables or placeholders that weren't in the original text
4. DO NOT add any text like {word}, {en}, {variable}, etc.
5. If the original text contains placeholders like {name} or {count}, keep them EXACTLY as they are
6. Keep the translation natural and appropriate for the target language
7. Preserve the tone and style of the original text

Your response should contain ONLY the translated text.`

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
