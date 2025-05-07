import ClientPage from "./ClientPage"
import type { Metadata } from "next"
import { getPageMetadata } from "@/lib/metadata"

// Export metadata for this page
export const metadata: Metadata = getPageMetadata(
  "/",
  "AI Translate Bot - Translate JSON Files with AI Precision",
  "Fast, accurate, and structure-preserving translations powered by Google's Gemini API",
)

export default function LandingPage() {
  return <ClientPage />
}
