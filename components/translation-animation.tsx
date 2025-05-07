"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const phrases = [
  { original: "Hello World", translated: "Hola Mundo" },
  { original: "Welcome", translated: "Bienvenue" },
  { original: "Good morning", translated: "おはようございます" },
  { original: "Thank you", translated: "Grazie" },
  { original: "How are you?", translated: "Comment ça va?" },
]

export function TranslationAnimation() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % phrases.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-32 md:h-40 w-full max-w-md mx-auto overflow-hidden rounded-lg bg-opacity-20 bg-white backdrop-blur-sm border border-white/20">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-xl md:text-2xl font-bold text-white">{phrases[currentIndex].original}</div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-white"
            >
              {phrases[currentIndex].translated}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
