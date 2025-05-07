import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="h-16 w-16 text-emerald-500 animate-spin mb-4" />
      <h2 className="text-2xl font-semibold text-slate-700">Loading Translator...</h2>
      <p className="text-slate-500 mt-2">Please wait while we prepare the translation tools</p>
    </div>
  )
}
