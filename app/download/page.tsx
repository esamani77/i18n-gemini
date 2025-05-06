"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function DownloadPage() {
  const memorytoUrl = "https://memoryto.com/en-us/download"

  // Function to redirect to Memoryto
  const redirectToMemoryto = () => {
    window.location.href = memorytoUrl
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="flex flex-col items-center max-w-md text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 cursor-pointer" onClick={redirectToMemoryto}>
          Download Memoryto
        </h1>

        <p className="text-lg text-gray-700 mb-8 cursor-pointer" onClick={redirectToMemoryto}>
          Study vocabulary, learn new languages, and improve your memory using powerful AI and spaced repetition
          techniques.
        </p>

        <div className="mb-8 cursor-pointer" onClick={redirectToMemoryto}>
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-dP3BY.png"
            alt="Memoryto App"
            width={300}
            height={600}
            className="rounded-3xl shadow-lg"
          />
        </div>

        <Button
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-8 py-3 rounded-lg text-lg"
          onClick={redirectToMemoryto}
        >
          Download the App
        </Button>
      </div>
    </div>
  )
}
