import type { Metadata } from "next"

// Base URL for the website
const baseUrl = "https://www.aitranslatebot.top"

// Default metadata
const defaultMetadata: Metadata = {
  title: {
    default: "AI Translate Bot - Translate JSON Files with AI Precision",
    template: "%s | AI Translate Bot",
  },
  description: "Fast, accurate, and structure-preserving translations powered by Google's Gemini API",
  metadataBase: new URL(baseUrl),
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "AI Translate Bot",
    images: [
      {
        url: `${baseUrl}/favicon.png`,
        width: 512,
        height: 512,
        alt: "AI Translate Bot Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Translate Bot - Translate JSON Files with AI Precision",
    description: "Fast, accurate, and structure-preserving translations powered by Google's Gemini API",
    images: [`${baseUrl}/favicon.png`],
  },
}

// Page-specific metadata
export const getPageMetadata = (path: string, title?: string, description?: string): Metadata => {
  const pageTitle = title || defaultMetadata.title?.default
  const pageDescription = description || defaultMetadata.description

  return {
    ...defaultMetadata,
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: `${baseUrl}${path}`,
    },
    openGraph: {
      ...defaultMetadata.openGraph,
      title: pageTitle,
      description: pageDescription,
      url: `${baseUrl}${path}`,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: pageTitle as string,
      description: pageDescription as string,
    },
  }
}

export default defaultMetadata
