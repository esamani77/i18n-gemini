import TranslationForm from "@/components/translation-form"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Translation API Client</h1>
            <p className="text-emerald-50 mt-2">Translate your JSON data between multiple languages</p>
          </div>

          <div className="p-6">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">About This Translation Service</h2>
              <p className="text-sm text-blue-700">
                This application uses Google's Gemini API to translate JSON data while preserving structure. The
                translation is performed directly on our server with built-in rate limiting and chunking for handling
                large files. For very large translations, the process may take several minutes.
              </p>
            </div>
            <TranslationForm />
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Translation API Client. All rights reserved.</p>
        </footer>
      </div>
    </main>
  )
}
