"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function LanguageLearningBox() {
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Don't show on download page
  const shouldShow = pathname !== "/download"

  useEffect(() => {
    if (shouldShow) {
      // Show after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1500)

      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [pathname, shouldShow])

  const handleClick = () => {
    router.push("/download")
  }

  if (!shouldShow) return null

  return (
    <div
      className={`fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-lg border border-yellow-200 p-4 transition-all duration-300 z-50 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-4 max-w-md">
        <div className="flex-shrink-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-aY6VjVniTPcg2V4CM6LqMHadornt6B.png"
            alt="Memoryto Logo"
            width={60}
            height={60}
          />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-800">Want to learn a new language?</h3>
          <p className="text-gray-600 text-sm mb-2">Try Memoryto's AI-powered spaced repetition system!</p>
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-white w-full" onClick={handleClick}>
            Click here
          </Button>
        </div>
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={() => setIsVisible(false)}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}
