import createMiddleware from "next-intl/middleware"

export default createMiddleware({
  // A list of all locales that are supported
  locales: ["en", "fr", "fa"],

  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  defaultLocale: "en",

  // Redirect to the default locale if no locale is detected
  localeDetection: true,
})

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}
