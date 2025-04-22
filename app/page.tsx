import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Globe, Zap, Shield, Code, BarChart } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Translate Your JSON Files with AI Precision
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-emerald-50">
              Fast, accurate, and structure-preserving translations powered by Google's Gemini API
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/translator">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-6 text-lg">
                  Start Translating <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="https://github.com/esamani77/i18n-gemini" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                >
                  View on GitHub <Code className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-800">
            Powerful Translation Features
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Globe className="h-10 w-10 text-emerald-500" />}
              title="Multiple Languages"
              description="Translate your JSON files between numerous languages while preserving the original structure."
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10 text-emerald-500" />}
              title="Fast Processing"
              description="Optimized translation process with built-in rate limiting to ensure maximum throughput."
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-emerald-500" />}
              title="Secure & Private"
              description="Your API keys are stored locally and your data never leaves your browser except to call the API."
            />
            <FeatureCard
              icon={<Code className="h-10 w-10 text-emerald-500" />}
              title="Structure Preservation"
              description="Maintains your JSON structure perfectly, ensuring your application works flawlessly."
            />
            <FeatureCard
              icon={<BarChart className="h-10 w-10 text-emerald-500" />}
              title="Progress Tracking"
              description="Real-time progress tracking with detailed statistics and estimated completion times."
            />
            <FeatureCard
              icon={<ArrowRight className="h-10 w-10 text-emerald-500" />}
              title="Easy Integration"
              description="Download translated files or copy directly to clipboard for seamless integration."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-800">Ready to Translate Your JSON Files?</h2>
          <p className="text-xl mb-10 text-slate-600 max-w-3xl mx-auto">
            Start using our powerful translation tool today and make your application accessible to users worldwide.
          </p>
          <Link href="/translator">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg">
              Go to Translator <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold text-white">Translation API Client</h3>
              <p className="mt-2">Powered by Google's Gemini API</p>
            </div>
            <div className="flex gap-8">
              <a
                href="https://github.com/esamani77/i18n-gemini"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/esamani77/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                LinkedIn
              </a>
              <Link href="/translator" className="hover:text-white transition-colors">
                Translator
              </Link>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p>© {new Date().getFullYear()} Translation API Client. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-100">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  )
}
