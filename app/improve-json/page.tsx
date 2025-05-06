import { ImproveJsonForm } from "@/components/improve-json-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function ImproveJsonPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="pl-0 flex items-center text-slate-600 hover:text-slate-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">JSON Translation Improver</h1>
            <p className="text-purple-50 mt-2">Enhance and optimize your translated JSON data</p>
          </div>

          <div className="p-6">
            <div className="mb-6 space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">About This Improvement Service</h2>
                <p className="text-sm text-blue-700">
                  This tool analyzes your source and translated JSON files, identifying translations that are
                  significantly longer than the original text (over 120% of the source length). It then optimizes only
                  those translations to be more concise while preserving meaning.
                </p>
              </div>
            </div>
            <ImproveJsonForm />
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Translation API Client. All rights reserved.</p>
        </footer>
      </div>
    </main>
  )
}
