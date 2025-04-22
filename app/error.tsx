"use client"

import { useEffect } from "react"
import { redirect } from "next/navigation"

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
    // Redirect to the default locale
    redirect("/en")
  }, [error])

  // This is a fallback and should never be displayed
  return null
}
