import { type NextRequest, NextResponse } from "next/server"
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
      return NextResponse.json({ error: "Missing JSON data" }, { status: 400 })
    }
    if (!targetLanguage) {
      return NextResponse.json({ error: "Missing target language" }, { status: 400 })
    }

    // Set API key if provided
    if (apiKey) {
      process.env.GEMINI_API_KEY = apiKey
    } else if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing API key" }, { status: 400 })
    }

    // Ensure temp directory exists
    fs.ensureDirSync(tempDir)

    // Create temporary input file
    const timestamp = Date.now()
    const inputFileName = `input-${timestamp}.json`
    const inputFilePath = path.join(tempDir, inputFileName)
    await fs.writeJSON(inputFilePath, jsonData, { spaces: 2 })

    // Translate the JSON
    const outputPath = await translationManager.translateLargeJson({
      inputJsonPath: inputFilePath,
      outputDir: tempDir,
      sourceLanguage,
      targetLanguage,
      chunkSize: 5,
      delayBetweenRequests: 1000,
      saveProgressInterval: 5,
    })

    // Read the output file
    const translatedData = await fs.readJSON(outputPath)

    // Clean up temporary files
    await fs.remove(inputFilePath)
    await fs.remove(outputPath)

    // Return the translated JSON
    return NextResponse.json({
      success: true,
      translatedData,
      sourceLanguage,
      targetLanguage,
    })
  } catch (error) {
    console.error("Translation API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
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
