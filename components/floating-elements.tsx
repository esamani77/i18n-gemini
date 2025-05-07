"use client"

import { motion } from "framer-motion"
import { FileJson, FileText, Languages, Sparkles } from "lucide-react"

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* JSON brackets */}
      <motion.div
        className="absolute text-white/20 text-4xl font-bold"
        initial={{ x: "10%", y: "20%", opacity: 0 }}
        animate={{
          x: ["10%", "15%", "10%"],
          y: ["20%", "25%", "20%"],
          opacity: 0.5,
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      >
        {"{"}
      </motion.div>

      <motion.div
        className="absolute text-white/20 text-4xl font-bold"
        initial={{ x: "85%", y: "70%", opacity: 0 }}
        animate={{
          x: ["85%", "80%", "85%"],
          y: ["70%", "65%", "70%"],
          opacity: 0.5,
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      >
        {"}"}
      </motion.div>

      {/* Icons */}
      <motion.div
        className="absolute"
        initial={{ x: "80%", y: "20%", opacity: 0, rotate: -10 }}
        animate={{
          x: ["80%", "75%", "80%"],
          y: ["20%", "25%", "20%"],
          opacity: 0.7,
          rotate: [-10, 10, -10],
        }}
        transition={{
          duration: 7,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      >
        <FileJson className="h-10 w-10 text-white/30" />
      </motion.div>

      <motion.div
        className="absolute"
        initial={{ x: "20%", y: "70%", opacity: 0, rotate: 10 }}
        animate={{
          x: ["20%", "25%", "20%"],
          y: ["70%", "65%", "70%"],
          opacity: 0.7,
          rotate: [10, -10, 10],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      >
        <FileText className="h-8 w-8 text-white/30" />
      </motion.div>

      <motion.div
        className="absolute"
        initial={{ x: "50%", y: "15%", opacity: 0, scale: 0.8 }}
        animate={{
          x: ["50%", "48%", "50%"],
          y: ["15%", "18%", "15%"],
          opacity: 0.7,
          scale: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      >
        <Languages className="h-12 w-12 text-white/30" />
      </motion.div>

      <motion.div
        className="absolute"
        initial={{ x: "85%", y: "40%", opacity: 0, scale: 0.8 }}
        animate={{
          x: ["85%", "80%", "85%"],
          y: ["40%", "45%", "40%"],
          opacity: 0.7,
          scale: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      >
        <Sparkles className="h-6 w-6 text-white/30" />
      </motion.div>
    </div>
  )
}
