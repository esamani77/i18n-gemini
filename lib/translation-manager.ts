import { GeminiTranslator } from "./gemini-translator"
import { FileHandler } from "./file-handler"
import fs from "fs-extra"
import path from "path"
import { RATE_LIMITS } from "./rate-limiter"

interface TranslationOptions {
  inputJsonPath: string
  outputDir: string
  sourceLanguage: string
  targetLanguage: string
  chunkSize?: number
  delayBetweenRequests?: number
  saveProgressInterval?: number
}

interface StreamingTranslationOptions extends TranslationOptions {
  onProgress?: (key: string, translation: string, progress: { completed: number; total: number }) => Promise<void>
  onComplete?: (translatedData: any) => Promise<void>
  onError?: (error: Error) => Promise<void>
}

interface TranslationProgress {
  completedKeys: string[]
  translatedFlatJson: Record<string, string>
  startTime: number
  totalKeys: number
}

export class TranslationManager {
  private translator: GeminiTranslator

  constructor() {
    this.translator = new GeminiTranslator()
  }

  async translateLargeJson({
    inputJsonPath,
    outputDir,
    sourceLanguage,
    targetLanguage,
    chunkSize = 5, // Reduced default chunk size to avoid hitting rate limits
    delayBetweenRequests = 1000,
    saveProgressInterval = 10,
  }: TranslationOptions): Promise<string> {
    // Ensure output directory exists
    fs.ensureDirSync(outputDir)

    // Read input JSON
    const inputJson = FileHandler.readJsonFile(inputJsonPath)

    // Generate output filename and progress filename
    const outputBasename = path.basename(inputJsonPath, path.extname(inputJsonPath))
    const outputFilename = `${outputBasename}-${targetLanguage}-${Date.now()}.json`
    const outputPath = path.join(outputDir, outputFilename)
    const progressFilename = `${outputBasename}-${targetLanguage}-progress.json`
    const progressFilePath = path.join(outputDir, progressFilename)

    // Translate JSON with chunking and progress tracking
    const translatedJson = await this.translateJsonWithChunking(
      inputJson,
      sourceLanguage,
      targetLanguage,
      chunkSize,
      delayBetweenRequests,
      progressFilePath,
      saveProgressInterval,
    )

    // Write translated JSON
    FileHandler.writeJsonFile(outputPath, translatedJson)

    // Clean up progress file if translation completed successfully
    if (fs.existsSync(progressFilePath)) {
      fs.removeSync(progressFilePath)
    }

    console.log(`Translation completed. Output saved to: ${outputPath}`)
    return outputPath
  }

  async translateJsonStreaming({
    inputJsonPath,
    outputDir,
    sourceLanguage,
    targetLanguage,
    chunkSize = 5,
    delayBetweenRequests = 1000,
    saveProgressInterval = 10,
    onProgress,
    onComplete,
    onError,
  }: StreamingTranslationOptions): Promise<void> {
    try {
      // Ensure output directory exists
      fs.ensureDirSync(outputDir)

      // Read input JSON
      const inputJson = FileHandler.readJsonFile(inputJsonPath)

      // Generate output filename and progress filename
      const outputBasename = path.basename(inputJsonPath, path.extname(inputJsonPath))
      const outputFilename = `${outputBasename}-${targetLanguage}-${Date.now()}.json`
      const outputPath = path.join(outputDir, outputFilename)
      const progressFilename = `${outputBasename}-${targetLanguage}-progress.json`
      const progressFilePath = path.join(outputDir, progressFilename)

      // Translate JSON with streaming
      const translatedJson = await this.translateJsonWithStreaming(
        inputJson,
        sourceLanguage,
        targetLanguage,
        chunkSize,
        delayBetweenRequests,
        progressFilePath,
        saveProgressInterval,
        onProgress,
      )

      // Write translated JSON
      FileHandler.writeJsonFile(outputPath, translatedJson)

      // Clean up progress file if translation completed successfully
      if (fs.existsSync(progressFilePath)) {
        fs.removeSync(progressFilePath)
      }

      // Call onComplete callback with the final result
      if (onComplete) {
        await onComplete(translatedJson)
      }

      console.log(`Translation completed. Output saved to: ${outputPath}`)
    } catch (error) {
      console.error("Translation streaming error:", error)
      if (onError && error instanceof Error) {
        await onError(error)
      }
    }
  }

  private async translateJsonWithStreaming(
    jsonObject: any,
    sourceLanguage: string,
    targetLanguage: string,
    chunkSize: number,
    delayBetweenRequests: number,
    progressFilePath: string,
    saveProgressInterval: number,
    onProgress?: (key: string, translation: string, progress: { completed: number; total: number }) => Promise<void>,
  ): Promise<any> {
    // Flatten the JSON to process in chunks
    const flattenedJson = this.flattenJson(jsonObject)
    const keys = Object.keys(flattenedJson)
    let progress: TranslationProgress

    // Check if there's a saved progress
    if (fs.existsSync(progressFilePath)) {
      try {
        progress = fs.readJSONSync(progressFilePath)
        console.log(
          `Resuming translation from saved progress. Completed: ${progress.completedKeys.length}/${progress.totalKeys} keys`,
        )
      } catch (error) {
        console.warn("Could not load progress file, starting fresh", error)
        progress = this.initializeProgress(keys)
      }
    } else {
      progress = this.initializeProgress(keys)
    }

    // Calculate remaining keys to process
    const remainingKeys = keys.filter((key) => !progress.completedKeys.includes(key))

    // Process remaining keys in chunks
    let processedSinceLastSave = 0
    let currentChunkSize = this.calculateOptimalChunkSize(chunkSize, remainingKeys.length)

    for (let i = 0; i < remainingKeys.length; i += currentChunkSize) {
      // Recalculate optimal chunk size periodically based on rate limits
      if (i % (currentChunkSize * 5) === 0) {
        currentChunkSize = this.calculateOptimalChunkSize(chunkSize, remainingKeys.length - i)
      }

      const chunk = remainingKeys.slice(i, i + currentChunkSize)
      const estimatedCompletion = this.estimateCompletion(
        progress.startTime,
        progress.completedKeys.length,
        keys.length,
      )

      console.log(
        `Processing chunk ${Math.floor(i / currentChunkSize) + 1}/${Math.ceil(
          remainingKeys.length / currentChunkSize,
        )}, Keys: ${progress.completedKeys.length}/${keys.length}, Estimated completion: ${estimatedCompletion}`,
      )

      // Translate chunk - one key at a time for streaming
      for (const key of chunk) {
        const text = flattenedJson[key]

        // Skip if not a string or empty
        if (typeof text !== "string" || !text.trim()) {
          progress.translatedFlatJson[key] = text
          progress.completedKeys.push(key)

          // Stream the result back to the client even for skipped items
          if (onProgress) {
            await onProgress(key, text, {
              completed: progress.completedKeys.length,
              total: keys.length,
            })
          }

          continue
        }

        try {
          const translation = await this.translator.translate({
            query: text,
            source: sourceLanguage,
            target: targetLanguage,
          })

          // Update progress
          progress.translatedFlatJson[key] = translation
          progress.completedKeys.push(key)

          // Stream the result back to the client
          if (onProgress) {
            await onProgress(key, translation, {
              completed: progress.completedKeys.length,
              total: keys.length,
            })
          }

          processedSinceLastSave++

          // Save progress periodically
          if (processedSinceLastSave >= saveProgressInterval) {
            await this.saveProgress(progressFilePath, progress)
            processedSinceLastSave = 0
          }
        } catch (error) {
          console.error(`Translation error for key ${key}:`, error)
          // Use original text as fallback
          progress.translatedFlatJson[key] = text
          progress.completedKeys.push(key)

          // Stream the error result back to the client
          if (onProgress) {
            await onProgress(key, text, {
              completed: progress.completedKeys.length,
              total: keys.length,
            })
          }
        }
      }

      // No need for explicit delay as the rate limiter handles it internally,
      // but we can add a small delay between chunks to spread the load
      if (i + currentChunkSize < remainingKeys.length) {
        await new Promise((resolve) => setTimeout(resolve, delayBetweenRequests))
      }
    }

    // Final save of progress
    await this.saveProgress(progressFilePath, progress)

    // Reconstruct the original JSON structure with translated values
    return this.unflattenJson(progress.translatedFlatJson, jsonObject)
  }

  private async translateJsonWithChunking(
    jsonObject: any,
    sourceLanguage: string,
    targetLanguage: string,
    chunkSize: number,
    delayBetweenRequests: number,
    progressFilePath: string,
    saveProgressInterval: number,
  ): Promise<any> {
    // Flatten the JSON to process in chunks
    const flattenedJson = this.flattenJson(jsonObject)
    const keys = Object.keys(flattenedJson)
    let progress: TranslationProgress

    // Check if there's a saved progress
    if (fs.existsSync(progressFilePath)) {
      try {
        progress = fs.readJSONSync(progressFilePath)
        console.log(
          `Resuming translation from saved progress. Completed: ${progress.completedKeys.length}/${progress.totalKeys} keys`,
        )
      } catch (error) {
        console.warn("Could not load progress file, starting fresh", error)
        progress = this.initializeProgress(keys)
      }
    } else {
      progress = this.initializeProgress(keys)
    }

    // Calculate remaining keys to process
    const remainingKeys = keys.filter((key) => !progress.completedKeys.includes(key))

    // Process remaining keys in chunks
    let processedSinceLastSave = 0
    let currentChunkSize = this.calculateOptimalChunkSize(chunkSize, remainingKeys.length)

    for (let i = 0; i < remainingKeys.length; i += currentChunkSize) {
      // Recalculate optimal chunk size periodically based on rate limits
      if (i % (currentChunkSize * 5) === 0) {
        currentChunkSize = this.calculateOptimalChunkSize(chunkSize, remainingKeys.length - i)
      }

      const chunk = remainingKeys.slice(i, i + currentChunkSize)
      const estimatedCompletion = this.estimateCompletion(
        progress.startTime,
        progress.completedKeys.length,
        keys.length,
      )

      console.log(
        `Processing chunk ${Math.floor(i / currentChunkSize) + 1}/${Math.ceil(
          remainingKeys.length / currentChunkSize,
        )}, Keys: ${progress.completedKeys.length}/${keys.length}, Estimated completion: ${estimatedCompletion}`,
      )

      // Translate chunk
      const chunkTranslations = await Promise.all(
        chunk.map(async (key) => {
          const text = flattenedJson[key]

          // Skip if not a string or empty
          if (typeof text !== "string" || !text.trim()) {
            return { key, translation: text }
          }

          try {
            const translation = await this.translator.translate({
              query: text,
              source: sourceLanguage,
              target: targetLanguage,
            })

            return { key, translation }
          } catch (error) {
            console.error(`Translation error for key ${key}:`, error)
            return { key, translation: text } // Fallback to original text
          }
        }),
      )

      // Update progress
      chunkTranslations.forEach(({ key, translation }) => {
        progress.translatedFlatJson[key] = translation
        progress.completedKeys.push(key)
      })

      processedSinceLastSave += chunk.length

      // Save progress periodically
      if (processedSinceLastSave >= saveProgressInterval) {
        await this.saveProgress(progressFilePath, progress)
        processedSinceLastSave = 0
      }

      // No need for explicit delay as the rate limiter handles it internally,
      // but we can add a small delay between chunks to spread the load
      if (i + currentChunkSize < remainingKeys.length) {
        await new Promise((resolve) => setTimeout(resolve, delayBetweenRequests))
      }
    }

    // Final save of progress
    await this.saveProgress(progressFilePath, progress)

    // Reconstruct the original JSON structure with translated values
    return this.unflattenJson(progress.translatedFlatJson, jsonObject)
  }

  private initializeProgress(keys: string[]): TranslationProgress {
    return {
      completedKeys: [],
      translatedFlatJson: {},
      startTime: Date.now(),
      totalKeys: keys.length,
    }
  }

  private async saveProgress(progressFilePath: string, progress: TranslationProgress): Promise<void> {
    try {
      await fs.writeJSON(progressFilePath, progress, { spaces: 2 })
      console.log(`Progress saved. Completed ${progress.completedKeys.length}/${progress.totalKeys} keys.`)
    } catch (error) {
      console.error("Failed to save translation progress", error)
    }
  }

  private calculateOptimalChunkSize(baseChunkSize: number, remainingKeys: number): number {
    // Adjust chunk size based on rate limits
    // We want to ensure we don't exceed the RPM limit
    const optimalChunkSize = Math.min(
      baseChunkSize,
      Math.floor(RATE_LIMITS.REQUESTS_PER_MINUTE / 2), // Use half the RPM limit to be safe
      Math.floor(RATE_LIMITS.REQUESTS_PER_DAY / 10), // Ensure we don't hit the daily limit too quickly
    )

    // Ensure chunk size is at least 1
    return Math.max(1, Math.min(optimalChunkSize, remainingKeys))
  }

  private estimateCompletion(startTime: number, completedKeys: number, totalKeys: number): string {
    if (completedKeys === 0) {
      return "Calculating..."
    }

    const elapsedMs = Date.now() - startTime
    const msPerKey = elapsedMs / completedKeys
    const remainingKeys = totalKeys - completedKeys
    const remainingMs = msPerKey * remainingKeys

    // Format the remaining time
    const remainingMinutes = Math.floor(remainingMs / 60000)
    const remainingHours = Math.floor(remainingMinutes / 60)

    if (remainingHours > 1) {
      return `~${remainingHours} hours ${remainingMinutes % 60} minutes`
    } else if (remainingMinutes > 1) {
      return `~${remainingMinutes} minutes`
    } else {
      return "Less than a minute"
    }
  }

  private flattenJson(obj: any, prefix = "", result: Record<string, string> = {}): Record<string, string> {
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
            this.flattenJson(item, arrayPrefix, result)
          }
        })
      } else if (typeof value === "object" && value !== null) {
        this.flattenJson(value, newPrefix, result)
      }
    }

    return result
  }

  private unflattenJson(flatJson: Record<string, string>, originalStructure: any): any {
    // Create a deep copy of the original structure
    const result = JSON.parse(JSON.stringify(originalStructure))

    // Iterate through flattened keys
    for (const [flatKey, translation] of Object.entries(flatJson)) {
      // Handle array notation like "key[0]"
      if (flatKey.includes("[")) {
        const parts = flatKey.split(/\.|\[|\]/).filter(Boolean)
        let current = result

        // Navigate to the nested property
        for (let i = 0; i < parts.length - 2; i += 2) {
          const key = parts[i]
          const index = Number.parseInt(parts[i + 1])

          if (!current[key]) current[key] = []
          if (!current[key][index]) current[key][index] = {}

          current = current[key][index]
        }

        // Set the value at the final key
        const lastKey = parts[parts.length - 2]
        const lastIndex = Number.parseInt(parts[parts.length - 1])

        if (!current[lastKey]) current[lastKey] = []
        current[lastKey][lastIndex] = translation
      } else {
        // Handle regular nested keys
        const path = flatKey.split(".")
        let current = result

        // Navigate to the nested property
        for (let i = 0; i < path.length - 1; i++) {
          if (!current[path[i]]) current[path[i]] = {}
          current = current[path[i]]
        }

        // Set the value at the final key
        const lastKey = path[path.length - 1]
        current[lastKey] = translation
      }
    }

    return result
  }
}
