import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import { LinkedInButton } from "@/components/linkedin-button"
import { SiteHeader } from "@/components/site-header"
import { LanguageLearningBox } from "@/components/language-learning-box"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { GoogleTagManager } from "@next/third-parties/google"
import defaultMetadata from "@/lib/metadata"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = defaultMetadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PHV5H77C"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SiteHeader />
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          <LanguageLearningBox />
          <LinkedInButton />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
        <GoogleTagManager gtmId="GTM-PHV5H77C" />
      </body>
    </html>
  )
}
