"use client"

import { Linkedin } from "lucide-react"
import { cn } from "@/lib/utils"

export function LinkedInButton() {
  return (
    <a
      href="https://www.linkedin.com/in/esamani77/"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center justify-center w-10 h-10 rounded-full",
        "bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-transform",
        "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
      )}
      title="Connect on LinkedIn"
    >
      <Linkedin className="h-5 w-5" />
      <span className="sr-only">Connect on LinkedIn</span>
    </a>
  )
}
