import fs from "fs-extra"
import path from "path"
import os from "os"

// Rate limits
export const RATE_LIMITS = {
  REQUESTS_PER_MINUTE: 15,
  TOKENS_PER_MINUTE: 1_000_000,
  REQUESTS_PER_DAY: 1_500,
}

interface RateLimitState {
  requestsInLastMinute: number
  tokensInLastMinute: number
  requestsToday: number
  lastRequest: number
  dayStartTimestamp: number
}

export class RateLimiter {
  private state: RateLimitState
  private statePath: string
  private initialized = false

  constructor(statePath: string = path.join(os.tmpdir(), "next-translation", ".rate-limit-state.json")) {
    this.statePath = statePath
    this.state = {
      requestsInLastMinute: 0,
      tokensInLastMinute: 0,
      requestsToday: 0,
      lastRequest: Date.now(),
      dayStartTimestamp: this.getStartOfDay(),
    }

    // Ensure the directory exists
    fs.ensureDirSync(path.dirname(this.statePath))
  }

  private getStartOfDay(): number {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    return startOfDay
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      if (fs.existsSync(this.statePath)) {
        const savedState = await fs.readJSON(this.statePath)

        // Reset day counter if it's a new day
        const currentDayStart = this.getStartOfDay()
        if (savedState.dayStartTimestamp < currentDayStart) {
          savedState.requestsToday = 0
          savedState.dayStartTimestamp = currentDayStart
        }

        // Reset minute counters if it's been more than a minute
        const minuteAgo = Date.now() - 60 * 1000
        if (savedState.lastRequest < minuteAgo) {
          savedState.requestsInLastMinute = 0
          savedState.tokensInLastMinute = 0
        }

        this.state = savedState
      }
    } catch (error) {
      console.warn("Could not load rate limit state, using default values", error)
    }

    this.initialized = true
  }

  private async saveState(): Promise<void> {
    try {
      await fs.writeJSON(this.statePath, this.state, { spaces: 2 })
    } catch (error) {
      console.error("Failed to save rate limit state", error)
    }
  }

  async checkRateLimit(estimatedTokens = 100): Promise<{ canProceed: boolean; timeToWait: number }> {
    await this.initialize()

    const now = Date.now()
    const currentDayStart = this.getStartOfDay()

    // Reset day counter if it's a new day
    if (this.state.dayStartTimestamp < currentDayStart) {
      this.state.requestsToday = 0
      this.state.dayStartTimestamp = currentDayStart
    }

    // Reset minute counters if it's been more than a minute
    const minuteAgo = now - 60 * 1000
    if (this.state.lastRequest < minuteAgo) {
      this.state.requestsInLastMinute = 0
      this.state.tokensInLastMinute = 0
    }

    // Check if we've exceeded any limits
    if (this.state.requestsInLastMinute >= RATE_LIMITS.REQUESTS_PER_MINUTE) {
      // Wait until the minute is up
      const timeToWait = 60 * 1000 - (now - this.state.lastRequest)
      return { canProceed: false, timeToWait: Math.max(timeToWait, 1000) }
    }

    if (this.state.tokensInLastMinute + estimatedTokens > RATE_LIMITS.TOKENS_PER_MINUTE) {
      // Wait until the minute is up
      const timeToWait = 60 * 1000 - (now - this.state.lastRequest)
      return { canProceed: false, timeToWait: Math.max(timeToWait, 1000) }
    }

    if (this.state.requestsToday >= RATE_LIMITS.REQUESTS_PER_DAY) {
      // Wait until tomorrow
      const tomorrow = currentDayStart + 24 * 60 * 60 * 1000
      const timeToWait = tomorrow - now
      return { canProceed: false, timeToWait }
    }

    return { canProceed: true, timeToWait: 0 }
  }

  async recordRequest(tokenCount = 100): Promise<void> {
    await this.initialize()

    const now = Date.now()

    // Update rate limit counters
    this.state.requestsInLastMinute++
    this.state.tokensInLastMinute += tokenCount
    this.state.requestsToday++
    this.state.lastRequest = now

    await this.saveState()
  }

  async waitForRateLimit(estimatedTokens = 100): Promise<void> {
    let check = await this.checkRateLimit(estimatedTokens)

    while (!check.canProceed) {
      console.log(`Rate limit reached. Waiting ${Math.ceil(check.timeToWait / 1000)} seconds...`)
      await new Promise((resolve) => setTimeout(resolve, check.timeToWait))
      check = await this.checkRateLimit(estimatedTokens)
    }
  }
}
