import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";
import { LinkedInButton } from "@/components/linkedin-button";
import { SiteHeader } from "@/components/site-header";
import { LanguageLearningBox } from "@/components/language-learning-box";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleTagManager } from "@next/third-parties/google";
import defaultMetadata from "@/lib/metadata";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = defaultMetadata;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return (
    <html lang={locale}>
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
          <NextIntlClientProvider>
            <SiteHeader />
            <Suspense fallback={<div>Loading...</div>}> {children}</Suspense>
            <LanguageLearningBox />
            <LinkedInButton />
          </NextIntlClientProvider>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
        <GoogleTagManager gtmId="GTM-PHV5H77C" />
      </body>
    </html>
  );
}
