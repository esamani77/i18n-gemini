import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import { LinkedInButton } from "@/components/linkedin-button"
import { SiteHeader } from "@/components/site-header"
// Make sure we're not importing the deleted component
// The current imports look good, but let's ensure there are no other references to VercelAnalytics

// The layout looks correct with the official Vercel components:
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Translation API Client",
  description: "A modern client for translating JSON data between multiple languages",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SiteHeader />
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          <LinkedInButton />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}
