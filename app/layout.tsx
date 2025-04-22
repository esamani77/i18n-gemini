import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import { LinkedInButton } from "@/components/linkedin-button"
import { VercelAnalytics } from "@/components/vercel-analytics"
import { SiteHeader } from "@/components/site-header"

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
          <VercelAnalytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
