/**
 * Splits a large JSON object into smaller chunks for processing
 */
export function chunkJSON(jsonData: Record<string, any>, maxChunkSize = 20): Record<string, any>[] {
  const chunks: Record<string, any>[] = []
  const entries = Object.entries(jsonData)

  // If the JSON is already small enough, return it as a single chunk
  if (entries.length <= maxChunkSize) {
    return [jsonData]
  }

  // Split into chunks
  for (let i = 0; i < entries.length; i += maxChunkSize) {
    const chunkEntries = entries.slice(i, i + maxChunkSize)
    const chunk = Object.fromEntries(chunkEntries)
    chunks.push(chunk)
  }

  return chunks
}

/**
 * Merges translated JSON chunks back into a single object
 */
export function mergeJSONChunks(chunks: Record<string, any>[]): Record<string, any> {
  return chunks.reduce((merged, chunk) => {
    return { ...merged, ...chunk }
  }, {})
}
