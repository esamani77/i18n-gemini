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
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()
    const encoder = new TextEncoder()

    // Start the translation process in the background
    translateInBackground(jsonData, sourceLanguage, targetLanguage, writer, encoder)

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

    // Set up the translation with streaming
    await translationManager.translateJsonStreaming({
      inputJsonPath: inputFilePath,
      outputDir: tempDir,
      sourceLanguage,
      targetLanguage,
      onProgress: async (key, translation, progress) => {
        // Send each translated key-value pair as it completes
        const message = {
          type: "progress",
          key,
          translation,
          progress,
        }
        await writer.write(encoder.encode(`data: ${JSON.stringify(message)}\n\n`))
      },
      onComplete: async (translatedData) => {
        // Send the complete translated data
        const message = {
          type: "complete",
          translatedData,
        }
        await writer.write(encoder.encode(`data: ${JSON.stringify(message)}\n\n`))
        await writer.close()
      },
      onError: async (error) => {
        // Send error message
        const message = {
          type: "error",
          error: error.message,
        }
        await writer.write(encoder.encode(`data: ${JSON.stringify(message)}\n\n`))
        await writer.close()
      },
    })

    // Clean up temporary files
    await fs.remove(inputFilePath)
  } catch (error) {
    console.error("Translation streaming error:", error)
    try {
      const message = {
        type: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      }
      await writer.write(encoder.encode(`data: ${JSON.stringify(message)}\n\n`))
    } finally {
      await writer.close()
    }
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
    responseLimit: "50mb",
  },
}
