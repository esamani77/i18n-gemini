"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Github, Sparkles, FileText, Menu, X } from "lucide-react"
import Image from "next/image"

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/favicon.png" alt="AI Translate Bot" width={32} height={32} className="rounded-md" />
            <span className="font-bold text-xl hidden sm:inline">AI Translate Bot</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <Link href="/">
            <Button
              variant={pathname === "/" ? "default" : "ghost"}
              className={cn(pathname === "/" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "")}
            >
              Home
            </Button>
          </Link>
          <Link href="/translator">
            <Button
              variant={pathname === "/translator" ? "default" : "ghost"}
              className={cn(pathname === "/translator" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "")}
            >
              Translator
            </Button>
          </Link>
          <Link href="/improve-json">
            <Button
              variant={pathname === "/improve-json" ? "default" : "ghost"}
              className={cn(
                pathname === "/improve-json" ? "bg-purple-600 hover:bg-purple-700 text-white" : "",
                "flex items-center",
              )}
            >
              {pathname === "/improve-json" && <Sparkles className="mr-1 h-4 w-4" />}
              Improve
            </Button>
          </Link>
          <Link href="/translate-article">
            <Button
              variant={pathname === "/translate-article" ? "default" : "ghost"}
              className={cn(
                pathname === "/translate-article" ? "bg-blue-600 hover:bg-blue-700 text-white" : "",
                "flex items-center",
              )}
            >
              {pathname === "/translate-article" && <FileText className="mr-1 h-4 w-4" />}
              Articles
            </Button>
          </Link>
          <a href="https://github.com/esamani77" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="icon">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Button>
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b shadow-sm">
          <nav className="flex flex-col p-4 space-y-3">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={pathname === "/" ? "default" : "ghost"}
                className={cn(
                  pathname === "/" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "",
                  "w-full justify-start",
                )}
              >
                Home
              </Button>
            </Link>
            <Link href="/translator" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={pathname === "/translator" ? "default" : "ghost"}
                className={cn(
                  pathname === "/translator" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "",
                  "w-full justify-start",
                )}
              >
                Translator
              </Button>
            </Link>
            <Link href="/improve-json" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={pathname === "/improve-json" ? "default" : "ghost"}
                className={cn(
                  pathname === "/improve-json" ? "bg-purple-600 hover:bg-purple-700 text-white" : "",
                  "w-full justify-start flex items-center",
                )}
              >
                {pathname === "/improve-json" && <Sparkles className="mr-1 h-4 w-4" />}
                Improve
              </Button>
            </Link>
            <Link href="/translate-article" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={pathname === "/translate-article" ? "default" : "ghost"}
                className={cn(
                  pathname === "/translate-article" ? "bg-blue-600 hover:bg-blue-700 text-white" : "",
                  "w-full justify-start flex items-center",
                )}
              >
                {pathname === "/translate-article" && <FileText className="mr-1 h-4 w-4" />}
                Articles
              </Button>
            </Link>
            <a
              href="https://github.com/esamani77"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <Github className="h-5 w-5" />
              <span>GitHub</span>
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
