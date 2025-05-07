"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Globe, Zap, Shield, Code, BarChart, Sparkles, FileText } from "lucide-react"
import { landingContent } from "@/content/landing-page"
import { TranslationAnimation } from "@/components/translation-animation"
import { FloatingElements } from "@/components/floating-elements"
import { TypingEffect } from "@/components/typing-effect"
import { motion } from "framer-motion"

export default function ClientPage() {
  const content = landingContent

  const scrollToTools = () => {
    const toolsSection = document.getElementById("tools-section")
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with new color palette */}
      <section className="relative bg-gradient-to-br from-[#9747FF] via-[#6366F1] to-[#2563EB] text-white py-20 overflow-hidden">
        <FloatingElements />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-40 h-40 md:w-48 md:h-48 relative"
              >
                <Image src="/favicon.png" alt="AI Translate Bot" width={200} height={200} className="object-contain" />
              </motion.div>
              <div className="text-center md:text-left">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
                >
                  <TypingEffect text={content.hero.title} speed={30} />
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-xl md:text-2xl mb-8 text-white/90"
                >
                  {content.hero.subtitle}
                </motion.p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <TranslationAnimation />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
            >
              <Button
                size="lg"
                className="bg-white text-[#6366F1] hover:bg-white/90 px-8 py-6 text-lg"
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
            </motion.div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" fill="#f8fafc">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-800"
          >
            {content.features.title}
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Globe className="h-10 w-10 text-[#6366F1]" />}
              title={content.features.cards[0].title}
              description={content.features.cards[0].description}
              delay={0}
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10 text-[#6366F1]" />}
              title={content.features.cards[1].title}
              description={content.features.cards[1].description}
              delay={0.1}
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-[#6366F1]" />}
              title={content.features.cards[2].title}
              description={content.features.cards[2].description}
              delay={0.2}
            />
            <FeatureCard
              icon={<Code className="h-10 w-10 text-[#6366F1]" />}
              title={content.features.cards[3].title}
              description={content.features.cards[3].description}
              delay={0.3}
            />
            <FeatureCard
              icon={<BarChart className="h-10 w-10 text-[#6366F1]" />}
              title={content.features.cards[4].title}
              description={content.features.cards[4].description}
              delay={0.4}
            />
            <FeatureCard
              icon={<ArrowRight className="h-10 w-10 text-[#6366F1]" />}
              title={content.features.cards[5].title}
              description={content.features.cards[5].description}
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools-section" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4 text-slate-800"
            >
              {content.tools.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-slate-600 max-w-3xl mx-auto"
            >
              {content.tools.subtitle}
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* JSON Translator Card */}
            <ToolCard
              gradient="from-[#6366F1] to-[#2563EB]"
              icon={<Code className="h-8 w-8 text-white" />}
              title={content.tools.cards[0].title}
              description={content.tools.cards[0].description}
              buttonText={content.tools.cards[0].button}
              href="/translator"
              delay={0}
            />

            {/* Translation Improver Card */}
            <ToolCard
              gradient="from-[#9747FF] to-[#6366F1]"
              icon={<Sparkles className="h-8 w-8 text-white" />}
              title={content.tools.cards[1].title}
              description={content.tools.cards[1].description}
              buttonText={content.tools.cards[1].button}
              href="/improve-json"
              delay={0.2}
            />

            {/* Article Translator Card */}
            <ToolCard
              gradient="from-[#2563EB] to-[#3B82F6]"
              icon={<FileText className="h-8 w-8 text-white" />}
              title={content.tools.cards[2].title}
              description={content.tools.cards[2].description}
              buttonText={content.tools.cards[2].button}
              href="/translate-article"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-6 text-slate-800"
          >
            {content.cta.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl mb-10 text-slate-600 max-w-3xl mx-auto"
          >
            {content.cta.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/translator">
              <Button size="lg" className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-8 py-6 text-lg">
                <Code className="mr-2 h-5 w-5" />
                Translate JSON
              </Button>
            </Link>
            <Link href="/improve-json">
              <Button size="lg" className="bg-[#9747FF] hover:bg-[#8B5CF6] text-white px-8 py-6 text-lg">
                <Sparkles className="mr-2 h-5 w-5" />
                Improve Translations
              </Button>
            </Link>
            <Link href="/translate-article">
              <Button size="lg" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-6 text-lg">
                <FileText className="mr-2 h-5 w-5" />
                Translate Articles
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 flex items-center gap-3">
              <Image src="/favicon.png" alt="AI Translate Bot" width={40} height={40} className="rounded-md" />
              <div>
                <h3 className="text-xl font-bold text-white">AI Translate Bot</h3>
                <p className="mt-1 text-sm">Powered by Google's Gemini API</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
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

function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ReactNode
  title: string
  description: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all border border-slate-100"
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </motion.div>
  )
}

function ToolCard({
  gradient,
  icon,
  title,
  description,
  buttonText,
  href,
  delay = 0,
}: {
  gradient: string
  icon: React.ReactNode
  title: string
  description: string
  buttonText: string
  href: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100 hover:shadow-xl transition-all"
    >
      <div className={`bg-gradient-to-r ${gradient} p-6`}>
        <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">{icon}</div>
        <h3 className="text-2xl font-bold text-white">{title}</h3>
      </div>
      <div className="p-6">
        <p className="text-slate-600 mb-6 min-h-[100px]">{description}</p>
        <Link href={href}>
          <Button className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 text-white`}>{buttonText}</Button>
        </Link>
      </div>
    </motion.div>
  )
}
