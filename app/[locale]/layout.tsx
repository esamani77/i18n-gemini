import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import { LinkedInButton } from "@/components/linkedin-button"
import { VercelAnalytics } from "@/components/vercel-analytics"
import { SiteHeader } from "@/components/site-header"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"

const inter = Inter({ subsets: ["latin"] })

type Props = {
  children: React.ReactNode
  params: { locale: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const messages = await getMessages({ locale })

  return {
    title: messages.app.title,
    description: messages.app.description,
  }
}

// Define the locales that are supported
const locales = ["en", "fr", "fa"]

export default async function RootLayout({ children, params: { locale } }: Props) {

  // Load the messages for the current locale
  const messages = await getMessages({ locale })

  return (
    <html lang={locale} dir={locale === "fa" ? "rtl" : "ltr"}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <SiteHeader />
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            <LinkedInButton />
            <VercelAnalytics />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
