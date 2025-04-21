import type { NextRequest } from "next/server"
import { GeminiTranslator } from "@/lib/gemini-translator"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { jsonData, targetLanguage, sourceLanguage = "en", apiKey } = body

    // Validate required fields
    if (!jsonData) {
      return new Response(JSON.stringify({ error: "Missing JSON data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    if (!targetLanguage) {
      return new Response(JSON.stringify({ error: "Missing target language" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Set API key if provided
    let translator: GeminiTranslator
    try {
      if (apiKey) {
        translator = new GeminiTranslator(apiKey)
      } else {
        return new Response(JSON.stringify({ error: "Missing API key" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }
    } catch (error) {
      console.error("Error initializing translator:", error)
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Failed to initialize translator",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Flatten the JSON to process keys one by one
    const flattenedJson = flattenJson(jsonData)
    const keys = Object.keys(flattenedJson)
    const totalKeys = keys.length

    // Create a stream
    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Send initial progress message
    await writer.write(
      encoder.encode(
        JSON.stringify({
          type: "init",
          totalKeys,
        }) + "\n",
      ),
    )

    // Process translation in the background
    translateInBackground(jsonData, flattenedJson, keys, sourceLanguage, targetLanguage, translator, writer, encoder)

    // Return the stream to the client
    return new Response(stream.readable, {
      headers: {
        "Content-Type": "application/json",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (error) {
    console.error("Translation API error:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

async function translateInBackground(
  originalJson: any,
  flattenedJson: Record<string, string>,
  keys: string[],
  sourceLanguage: string,
  targetLanguage: string,
  translator: GeminiTranslator,
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder,
) {
  try {
    const translatedFlatJson: Record<string, string> = {}
    let completed = 0

    for (const key of keys) {
      const text = flattenedJson[key]

      try {
        // Skip if not a string or empty
        if (typeof text !== "string" || !text.trim()) {
          translatedFlatJson[key] = text
        } else {
          // Translate the text
          const translation = await translator.translate({
            query: text,
            source: sourceLanguage,
            target: targetLanguage,
          })
          translatedFlatJson[key] = translation
        }

        // Update progress
        completed++

        // Send progress update
        await writer.write(
          encoder.encode(
            JSON.stringify({
              type: "progress",
              key,
              translation: translatedFlatJson[key],
              progress: {
                completed,
                total: keys.length,
              },
            }) + "\n",
          ),
        )
      } catch (error) {
        console.error(`Translation error for key ${key}:`, error)
        // Use original text as fallback
        translatedFlatJson[key] = text

        // Update progress even on error
        completed++

        // Send progress update with error
        await writer.write(
          encoder.encode(
            JSON.stringify({
              type: "progress",
              key,
              translation: text,
              error: error instanceof Error ? error.message : "Unknown error",
              progress: {
                completed,
                total: keys.length,
              },
            }) + "\n",
          ),
        )
      }
    }

    // Reconstruct the original JSON structure with translated values
    const translatedJson = unflattenJson(translatedFlatJson, originalJson)

    // Send completion message
    await writer.write(
      encoder.encode(
        JSON.stringify({
          type: "complete",
          translatedData: translatedJson,
        }) + "\n",
      ),
    )
  } catch (error) {
    console.error("Translation streaming error:", error)
    try {
      await writer.write(
        encoder.encode(
          JSON.stringify({
            type: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          }) + "\n",
        ),
      )
    } finally {
      // Nothing to do here
    }
  } finally {
    await writer.close()
  }
}

// Helper functions for flattening and unflattening JSON
function flattenJson(obj: any, prefix = "", result: Record<string, string> = {}): Record<string, string> {
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

function unflattenJson(flatJson: Record<string, string>, originalStructure: any): any {
  // Create a deep copy of the original structure
  const result = JSON.parse(JSON.stringify(originalStructure))

  // Iterate through flattened keys
  for (const [flatKey, translation] of Object.entries(flatJson)) {
    try {
      // Handle array notation like "key[0]"
      if (flatKey.includes("[")) {
        const parts = flatKey.split(/\.|\[|\]/).filter(Boolean)
        let current = result

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
        current[lastKey][lastIndex] = translation
      } else {
        // Handle regular nested keys
        const path = flatKey.split(".")
        let current = result

        // Navigate to the nested property
        for (let i = 0; i < path.length - 1; i++) {
          if (current[path[i]] === undefined) current[path[i]] = {}
          current = current[path[i]]
        }

        // Set the value at the final key
        const lastKey = path[path.length - 1]
        current[lastKey] = translation
      }
    } catch (error) {
      console.error(`Error unflattening key ${flatKey}:`, error)
    }
  }

  return result
}
