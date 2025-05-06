"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Globe, Zap, Shield, Code, BarChart, Sparkles, FileText } from "lucide-react"
import { landingContent } from "@/content/landing-page"

export default function LandingPage() {
  const content = landingContent

  const scrollToTools = () => {
    const toolsSection = document.getElementById("tools-section")
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{content.hero.title}</h1>
            <p className="text-xl md:text-2xl mb-10 text-emerald-50">{content.hero.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-6 text-lg"
                onClick={scrollToTools}
              >
                {content.hero.translateButton} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <a href="https://github.com/esamani77" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                >
                  {content.hero.githubButton} <Code className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-800">{content.features.title}</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Globe className="h-10 w-10 text-emerald-500" />}
              title={content.features.cards[0].title}
              description={content.features.cards[0].description}
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10 text-emerald-500" />}
              title={content.features.cards[1].title}
              description={content.features.cards[1].description}
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-emerald-500" />}
              title={content.features.cards[2].title}
              description={content.features.cards[2].description}
            />
            <FeatureCard
              icon={<Code className="h-10 w-10 text-emerald-500" />}
              title={content.features.cards[3].title}
              description={content.features.cards[3].description}
            />
            <FeatureCard
              icon={<BarChart className="h-10 w-10 text-emerald-500" />}
              title={content.features.cards[4].title}
              description={content.features.cards[4].description}
            />
            <FeatureCard
              icon={<ArrowRight className="h-10 w-10 text-emerald-500" />}
              title={content.features.cards[5].title}
              description={content.features.cards[5].description}
            />
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools-section" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">{content.tools.title}</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">{content.tools.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* JSON Translator Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-emerald-100 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Code className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">{content.tools.cards[0].title}</h3>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-6 min-h-[100px]">{content.tools.cards[0].description}</p>
                <Link href="/translator">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    {content.tools.cards[0].button}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Translation Improver Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-purple-100 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6">
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">{content.tools.cards[1].title}</h3>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-6 min-h-[100px]">{content.tools.cards[1].description}</p>
                <Link href="/improve-json">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    {content.tools.cards[1].button}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Article Translator Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">{content.tools.cards[2].title}</h3>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-6 min-h-[100px]">{content.tools.cards[2].description}</p>
                <Link href="/translate-article">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    {content.tools.cards[2].button}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-800">{content.cta.title}</h2>
          <p className="text-xl mb-10 text-slate-600 max-w-3xl mx-auto">{content.cta.subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/translator">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg">
                <Code className="mr-2 h-5 w-5" />
                Translate JSON
              </Button>
            </Link>
            <Link href="/improve-json">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">
                <Sparkles className="mr-2 h-5 w-5" />
                Improve Translations
              </Button>
            </Link>
            <Link href="/translate-article">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                <FileText className="mr-2 h-5 w-5" />
                Translate Articles
              </Button>
            </Link>
          </div>
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
                href="https://github.com/esamani77"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                {content.footer.links.github}
              </a>
              <a
                href="https://www.linkedin.com/in/esamani77/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                {content.footer.links.linkedin}
              </a>
              <Link href="/translator" className="hover:text-white transition-colors">
                {content.footer.links.translator}
              </Link>
              <Link href="/improve-json" className="hover:text-white transition-colors">
                {content.footer.links.improver}
              </Link>
              <Link href="/translate-article" className="hover:text-white transition-colors">
                {content.footer.links.articles}
              </Link>
              <Link href="/download" className="hover:text-white transition-colors">
                Download
              </Link>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p>{content.footer.copyright}</p>
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
