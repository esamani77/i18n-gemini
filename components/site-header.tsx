"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Github, Sparkles, FileText, Menu, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import LocaleSwitcherSelect from "./LocaleSwitcherSelect";
import { routing, langs } from "@/i18n/routing";

export function SiteHeader() {
  const pathname = usePathname();
  const t = useTranslations("LocaleSwitcher");
  const tHeader = useTranslations("header");
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/favicon.png"
              alt="AI Translate Bot"
              width={32}
              height={32}
              className="rounded-md"
            />
            <span className="font-bold text-xl hidden sm:inline">
              AI Translate Bot
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <Link href="/">
            <Button
              variant={pathname === "/" ? "default" : "ghost"}
              className={cn(
                pathname === "/"
                  ? "bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                  : ""
              )}
            >
              {tHeader("home")}
            </Button>
          </Link>
          <Link href="/translator">
            <Button
              variant={pathname === "/translator" ? "default" : "ghost"}
              className={cn(
                pathname === "/translator"
                  ? "bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                  : ""
              )}
            >
              {tHeader("translator")}
            </Button>
          </Link>
          <Link href="/improve-json">
            <Button
              variant={pathname === "/improve-json" ? "default" : "ghost"}
              className={cn(
                pathname === "/improve-json"
                  ? "bg-[#9747FF] hover:bg-[#8B5CF6] text-white"
                  : "",
                "flex items-center"
              )}
            >
              {pathname === "/improve-json" && (
                <Sparkles className="mr-1 h-4 w-4" />
              )}
              {tHeader("improve")}
            </Button>
          </Link>
          <Link href="/translate-article">
            <Button
              variant={pathname === "/translate-article" ? "default" : "ghost"}
              className={cn(
                pathname === "/translate-article"
                  ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                  : "",
                "flex items-center"
              )}
            >
              {pathname === "/translate-article" && (
                <FileText className="mr-1 h-4 w-4" />
              )}
              {tHeader("articles")}
            </Button>
          </Link>
          <a
            href="https://github.com/esamani77"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="icon">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Button>
          </a>
          <LocaleSwitcherSelect
            locale={locale}
            defaultValue={locale}
            label={t("label")}
          >
            {routing.locales.map((cur) => (
              <option key={cur} value={cur}>
                {langs[cur].name}
                <span className="text-xs text-gray-500">
                  ({langs[cur].spoken})
                </span>
              </option>
            ))}
          </LocaleSwitcherSelect>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
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
                  pathname === "/"
                    ? "bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                    : "",
                  "w-full justify-start"
                )}
              >
                {tHeader("home")}
              </Button>
            </Link>
            <Link href="/translator" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={pathname === "/translator" ? "default" : "ghost"}
                className={cn(
                  pathname === "/translator"
                    ? "bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                    : "",
                  "w-full justify-start"
                )}
              >
                {tHeader("translator")}
              </Button>
            </Link>
            <Link href="/improve-json" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={pathname === "/improve-json" ? "default" : "ghost"}
                className={cn(
                  pathname === "/improve-json"
                    ? "bg-[#9747FF] hover:bg-[#8B5CF6] text-white"
                    : "",
                  "w-full justify-start flex items-center"
                )}
              >
                {pathname === "/improve-json" && (
                  <Sparkles className="mr-1 h-4 w-4" />
                )}
                {tHeader("improve")}
              </Button>
            </Link>
            <Link
              href="/translate-article"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button
                variant={
                  pathname === "/translate-article" ? "default" : "ghost"
                }
                className={cn(
                  pathname === "/translate-article"
                    ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                    : "",
                  "w-full justify-start flex items-center"
                )}
              >
                {pathname === "/translate-article" && (
                  <FileText className="mr-1 h-4 w-4" />
                )}
                {tHeader("articles")}
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
              <span>{tHeader("github")}</span>
            </a>
            <LocaleSwitcherSelect
              locale={locale}
              defaultValue={locale}
              label={t("label")}
            >
              {routing.locales.map((cur) => (
                <option key={cur} value={cur}>
                  {langs[cur].name}
                  <span className="text-xs text-gray-500">
                    ({langs[cur].spoken})
                  </span>
                </option>
              ))}
            </LocaleSwitcherSelect>
          </nav>
        </div>
      )}
    </header>
  );
}
