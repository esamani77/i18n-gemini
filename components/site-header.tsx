"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Github, Sparkles, FileText } from "lucide-react"

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">Translation API</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
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
        </div>
      </div>
    </header>
  )
}
