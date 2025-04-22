"use client"

import { useState, useEffect } from "react"
import { X, Star, Github, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StarRepoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function StarRepoModal({ isOpen, onClose }: StarRepoModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300"
      style={{ opacity: isOpen ? 1 : 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-300"
        style={{ transform: isOpen ? "scale(1)" : "scale(0.95)" }}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Support This Project</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <Star className="h-16 w-16 text-amber-400 mb-4" />
            <p className="text-center text-slate-600 dark:text-slate-300">
              If you found this translation tool helpful, please consider giving the project a star on GitHub!
            </p>
          </div>

          <div className="space-y-4">
            <a
              href="https://github.com/esamani77/i18n-gemini"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-white py-3 px-4 rounded-md transition-colors"
            >
              <Github className="h-5 w-5" />
              <span>Star on GitHub</span>
            </a>

            <a
              href="https://www.linkedin.com/in/esamani77/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition-colors"
            >
              <Linkedin className="h-5 w-5" />
              <span>Connect on LinkedIn</span>
            </a>

            <a
              href="https://www.coffeebede.com/esamani77"
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center w-full"
            >
              <img
                className="w-full max-w-[240px]"
                src="https://coffeebede.ir/DashboardTemplateV2/app-assets/images/banner/default-yellow.svg"
                alt="Buy me a coffee"
              />
            </a>
          </div>

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Thank you for using the Translation API Client!
          </div>
        </div>
      </div>
    </div>
  )
}
