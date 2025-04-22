"use client"

import { Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LinkedInButton() {
  return (
    <a
      href="https://www.linkedin.com/in/esamani77/"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50"
    >
      <Button
        variant="outline"
        size="icon"
        className="rounded-full bg-white shadow-md hover:bg-blue-50 border-blue-200"
      >
        <Linkedin className="h-5 w-5 text-blue-600" />
        <span className="sr-only">LinkedIn Profile</span>
      </Button>
    </a>
  )
}
