"use client"

import { redirect } from "next/navigation"
import { useEffect } from "react"

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
    // Redirect to the default locale's error page
    redirect("/en/error")
  }, [error])

  // This is a fallback and should never be displayed
  return null
}
