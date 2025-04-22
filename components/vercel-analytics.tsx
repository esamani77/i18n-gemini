"use client"

import { useEffect } from "react"

export function VercelAnalytics() {
  useEffect(() => {
    // This is a simple wrapper to load Vercel analytics
    // We're using a try-catch to prevent errors if the packages aren't available
    try {
      import("@vercel/analytics/react")
        .then(({ inject }) => {
          inject()
        })
        .catch(() => {
          // Silently fail if the package isn't available
        })

      import("@vercel/speed-insights/next")
        .then(({ inject }) => {
          inject()
        })
        .catch(() => {
          // Silently fail if the package isn't available
        })
    } catch (error) {
      // Silently fail if there's an error
    }
  }, [])

  return null
}
