import type { Metadata } from "next"
import { getPageMetadata } from "@/lib/metadata"
import DownloadPageClient from "./DownloadPageClient"

// Export metadata for this page
export const metadata: Metadata = getPageMetadata(
  "/download",
  "Download Memoryto - AI Translate Bot",
  "Download Memoryto app for language learning with AI-powered spaced repetition",
)

export default function DownloadPage() {
  return <DownloadPageClient />
}
