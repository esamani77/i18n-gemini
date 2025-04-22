"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Globe, Zap, Shield, Code, BarChart } from "lucide-react"
import { useTranslations } from "next-intl"

export default function LandingPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{t("landing.hero.title")}</h1>
            <p className="text-xl md:text-2xl mb-10 text-emerald-50">{t("landing.hero.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/translator">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-6 text-lg">
                  {t("landing.hero.cta")} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="https://github.com/esamani77" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                >
                  {t("landing.hero.github")} <Code className="ml-2 h-5 w-5" />
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
            {t("landing.features.title")}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Globe className="h-10 w-10 text-emerald-500" />}
              title={t("landing.features.multipleLanguages.title")}
              description={t("landing.features.multipleLanguages.description")}
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10 text-emerald-500" />}
              title={t("landing.features.fastProcessing.title")}
              description={t("landing.features.fastProcessing.description")}
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-emerald-500" />}
              title={t("landing.features.securePrivate.title")}
              description={t("landing.features.securePrivate.description")}
            />
            <FeatureCard
              icon={<Code className="h-10 w-10 text-emerald-500" />}
              title={t("landing.features.structurePreservation.title")}
              description={t("landing.features.structurePreservation.description")}
            />
            <FeatureCard
              icon={<BarChart className="h-10 w-10 text-emerald-500" />}
              title={t("landing.features.progressTracking.title")}
              description={t("landing.features.progressTracking.description")}
            />
            <FeatureCard
              icon={<ArrowRight className="h-10 w-10 text-emerald-500" />}
              title={t("landing.features.easyIntegration.title")}
              description={t("landing.features.easyIntegration.description")}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-800">{t("landing.cta.title")}</h2>
          <p className="text-xl mb-10 text-slate-600 max-w-3xl mx-auto">{t("landing.cta.description")}</p>
          <Link href="/translator">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg">
              {t("landing.cta.button")} <ArrowRight className="ml-2 h-5 w-5" />
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
              <p className="mt-2">{t("footer.poweredBy")}</p>
            </div>
            <div className="flex gap-8">
              <a
                href="https://github.com/esamani77"
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
                {t("navigation.translator")}
              </Link>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
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
