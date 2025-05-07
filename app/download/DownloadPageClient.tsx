"use client"

import { useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function DownloadPageClient() {
  const memorytoUrl = "https://memoryto.com/en-us/download"

  // Function to redirect to Memoryto and track event
  const handleDownloadClick = () => {
    // Push event to dataLayer for GTM
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "download_clicked",
        eventCategory: "User Engagement",
        eventAction: "Download App",
        eventLabel: "Memoryto App",
      })
    }

    // Redirect to Memoryto
    window.location.href = memorytoUrl
  }

  // Declare dataLayer for TypeScript
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || []
    }
  }, [])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="flex flex-col items-center max-w-md w-full text-center px-4 sm:px-0">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 cursor-pointer" onClick={handleDownloadClick}>
          Download Memoryto
        </h1>

        <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 cursor-pointer" onClick={handleDownloadClick}>
          Study vocabulary, learn new languages, and improve your memory using powerful AI and spaced repetition
          techniques.
        </p>

        <div
          className="mb-6 sm:mb-8 cursor-pointer w-full max-w-[250px] sm:max-w-[300px]"
          onClick={handleDownloadClick}
        >
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-dP3BY.png"
            alt="Memoryto App"
            width={300}
            height={600}
            className="rounded-3xl shadow-lg w-full h-auto"
          />
        </div>

        <Button
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg w-full sm:w-auto"
          onClick={handleDownloadClick}
        >
          Download the App
        </Button>
      </div>
    </div>
  )
}
