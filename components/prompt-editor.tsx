"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertCircle, Check, Edit, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface PromptEditorProps {
  defaultPrompt: string
  onPromptChange: (prompt: string) => void
  disabled?: boolean
}

export function PromptEditor({ defaultPrompt, onPromptChange, disabled = false }: PromptEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleSave = () => {
    onPromptChange(prompt)
    setIsEditing(false)
  }

  const handleReset = () => {
    setPrompt(defaultPrompt)
    onPromptChange(defaultPrompt)
    setShowResetConfirm(false)
    setIsEditing(false)
  }

  return (
    <Card className={cn("border-slate-200", disabled && "opacity-75")}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Translation Prompt</CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} disabled={disabled} className="h-8">
              <Edit className="h-3.5 w-3.5 mr-1" />
              Customize
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPrompt(defaultPrompt)
                  setIsEditing(false)
                }}
                className="h-8 border-slate-200"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                className="h-8 bg-emerald-600 hover:bg-emerald-700"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Save
              </Button>
            </div>
          )}
        </div>
        <CardDescription>Customize how the AI translates your content. Advanced users only.</CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[150px] font-mono text-sm"
              placeholder="Enter your custom translation prompt..."
            />

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
                className="text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                Reset to Default
              </Button>

              <div className="text-xs text-slate-500">
                <span className="font-medium">Variables:</span>{" "}
                <code className="bg-slate-100 px-1 py-0.5 rounded">{"{text}"}</code>,{" "}
                <code className="bg-slate-100 px-1 py-0.5 rounded">{"{sourceLanguage}"}</code>,{" "}
                <code className="bg-slate-100 px-1 py-0.5 rounded">{"{targetLanguage}"}</code>
              </div>
            </div>

            {showResetConfirm && (
              <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex justify-between items-center">
                  <span>Are you sure you want to reset to the default prompt?</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowResetConfirm(false)}
                      className="h-7 border-amber-300 hover:bg-amber-100"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleReset}
                      className="h-7 bg-amber-600 hover:bg-amber-700"
                    >
                      Reset
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 p-3 rounded-md border border-slate-100 text-sm text-slate-700 relative">
            <div className="max-h-[100px] overflow-y-auto pr-1 font-mono text-xs">{prompt}</div>
            {!isEditing && (
              <div className="absolute bottom-2 right-2 bg-white p-1 rounded-full shadow-sm border border-slate-200">
                <Info className="h-4 w-4 text-slate-400" />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
