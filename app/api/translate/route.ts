import type { NextRequest } from "next/server"
import { TranslationManager } from "@/lib/translation-manager"
import fs from "fs-extra"
import path from "path"
import os from "os"

// Create temporary directory for storing files
const tempDir = path.join(os.tmpdir(), "next-translation")

// Initialize the translation manager
const translationManager = new TranslationManager()

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
    if (apiKey) {
      process.env.GEMINI_API_KEY = apiKey
    } else if (!process.env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Create a stream
    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Start the translation process in the background
    translateInBackground(jsonData, sourceLanguage, targetLanguage, writer, encoder).catch((error) => {
      console.error("Background translation error:", error)
    })

    // Return the stream to the client
    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
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
  jsonData: any,
  sourceLanguage: string,
  targetLanguage: string,
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder,
) {
  try {
    // Ensure temp directory exists
    fs.ensureDirSync(tempDir)

    // Create temporary input file
    const timestamp = Date.now()
    const inputFileName = `input-${timestamp}.json`
    const inputFilePath = path.join(tempDir, inputFileName)
    await fs.writeJSON(inputFilePath, jsonData, { spaces: 2 })

    // Count total keys for progress tracking
    const flattenedJson = flattenJson(jsonData)
    const totalKeys = Object.keys(flattenedJson).length

    // Send initial progress message
    await sendSSEMessage(writer, encoder, {
      type: "init",
      totalKeys,
    })

    // Set up the translation with streaming
    await translationManager.translateJsonStreaming({
      inputJsonPath: inputFilePath,
      outputDir: tempDir,
      sourceLanguage,
      targetLanguage,
      onProgress: async (key, translation, progress) => {
        // Send each translated key-value pair as it completes
        await sendSSEMessage(writer, encoder, {
          type: "progress",
          key,
          translation,
          progress,
        })
      },
      onComplete: async (translatedData) => {
        // Send the complete translated data
        await sendSSEMessage(writer, encoder, {
          type: "complete",
          translatedData,
        })
        await writer.close()
      },
      onError: async (error) => {
        // Send error message
        await sendSSEMessage(writer, encoder, {
          type: "error",
          error: error.message,
        })
        await writer.close()
      },
    })

    // Clean up temporary files
    await fs.remove(inputFilePath)
  } catch (error) {
    console.error("Translation streaming error:", error)
    try {
      await sendSSEMessage(writer, encoder, {
        type: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      await writer.close()
    }
  }
}

// Helper function to send SSE messages
async function sendSSEMessage(writer: WritableStreamDefaultWriter, encoder: TextEncoder, data: any): Promise<void> {
  try {
    const message = `data: ${JSON.stringify(data)}\n\n`
    await writer.write(encoder.encode(message))
  } catch (error) {
    console.error("Error sending SSE message:", error)
  }
}

// Helper functions for flattening JSON
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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
    responseLimit: "50mb",
  },
}
