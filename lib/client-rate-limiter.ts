export const CLIENT_RATE_LIMITS = {
  REQUESTS_PER_MINUTE: 15,
  REQUESTS_PER_DAY: 1500,
}

// Client-side rate limiter that works in the browser
export class ClientRateLimiter {
  private requestsInLastMinute = 0
  private requestsToday = 0
  private lastRequestTime = 0
  private dayStartTimestamp = 0
  private maxRequestsPerMinute: number
  private maxRequestsPerDay: number

  constructor(maxRequestsPerMinute = 15, maxRequestsPerDay = 1500) {
    this.maxRequestsPerMinute = maxRequestsPerMinute
    this.maxRequestsPerDay = maxRequestsPerDay
    this.dayStartTimestamp = this.getStartOfDay()
    this.resetCountersIfNeeded()
  }

  private getStartOfDay(): number {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    return startOfDay
  }

  private resetCountersIfNeeded(): void {
    const now = Date.now()
    const currentDayStart = this.getStartOfDay()

    // Reset day counter if it's a new day
    if (this.dayStartTimestamp < currentDayStart) {
      this.requestsToday = 0
      this.dayStartTimestamp = currentDayStart
    }

    // Reset minute counter if it's been more than a minute
    const minuteAgo = now - 60 * 1000
    if (this.lastRequestTime < minuteAgo) {
      this.requestsInLastMinute = 0
    }
  }

  async checkRateLimit(): Promise<{ canProceed: boolean; timeToWait: number }> {
    this.resetCountersIfNeeded()

    const now = Date.now()

    // Check if we've exceeded any limits
    if (this.requestsInLastMinute >= this.maxRequestsPerMinute) {
      // Wait until the minute is up
      const timeToWait = 60 * 1000 - (now - this.lastRequestTime)
      return { canProceed: false, timeToWait: Math.max(timeToWait, 1000) }
    }

    if (this.requestsToday >= this.maxRequestsPerDay) {
      // Wait until tomorrow
      const tomorrow = this.getStartOfDay() + 24 * 60 * 60 * 1000
      const timeToWait = tomorrow - now
      return { canProceed: false, timeToWait }
    }

    return { canProceed: true, timeToWait: 0 }
  }

  recordRequest(): void {
    this.resetCountersIfNeeded()
    this.requestsInLastMinute++
    this.requestsToday++
    this.lastRequestTime = Date.now()
  }

  async waitForRateLimit(): Promise<void> {
    let check = await this.checkRateLimit()

    while (!check.canProceed) {
      // Wait for the specified time
      await new Promise((resolve) => setTimeout(resolve, check.timeToWait))
      check = await this.checkRateLimit()
    }
  }

  getRateLimitStatus(): { requestsInLastMinute: number; requestsToday: number } {
    this.resetCountersIfNeeded()
    return {
      requestsInLastMinute: this.requestsInLastMinute,
      requestsToday: this.requestsToday,
    }
  }
}
