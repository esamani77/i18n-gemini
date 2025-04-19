import axios from "axios"

/**
 * Makes an API request with automatic retries
 */
export async function makeRequestWithRetry(
  url: string,
  data: any,
  options: {
    maxRetries?: number
    retryDelay?: number
    timeout?: number
  } = {},
) {
  const { maxRetries = 3, retryDelay = 2000, timeout = 300000 } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Increase timeout for each retry attempt
      const response = await axios.post(url, data, {
        timeout: timeout + attempt * 60000, // Add 1 minute for each retry
      })

      return response.data
    } catch (error: any) {
      lastError = error

      // Don't retry if it's a client error (4xx)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw error
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryDelay))
    }
  }

  throw lastError
}
