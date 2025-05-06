"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface BeautifyJsonButtonProps {
  jsonInput: string
  onBeautify: (formattedJson: string) => void
}

export function BeautifyJsonButton({ jsonInput, onBeautify }: BeautifyJsonButtonProps) {
  const handleBeautify = () => {
    try {
      // Parse and then stringify with indentation
      const parsedJson = JSON.parse(jsonInput)
      const beautified = JSON.stringify(parsedJson, null, 2)
      onBeautify(beautified)
    } catch (error) {
      // If there's an error parsing the JSON, alert the user
      alert("Invalid JSON. Please check your input.")
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleBeautify}
      className="flex items-center gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
    >
      <Sparkles className="h-3.5 w-3.5" />
      <span>Beautify JSON</span>
    </Button>
  )
}
