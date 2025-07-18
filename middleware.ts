import { type NextRequest, NextResponse } from "next/server"

const locales = ["en", "ar", "hi"]
const defaultLocale = "en"

function getLocale(request: NextRequest) {
  // Simple locale detection without external dependencies
  const acceptLanguage = request.headers.get("accept-language")

  if (acceptLanguage) {
    // Basic language detection
    if (acceptLanguage.includes("ar")) return "ar"
    if (acceptLanguage.includes("hi")) return "hi"
  }

  return defaultLocale
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the pathname is missing a locale
  const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

  if (pathnameHasLocale) return NextResponse.next()

  // Redirect if there is no locale
  const locale = getLocale(request)
  const newUrl = new URL(`/${locale}${pathname}`, request.url)

  return NextResponse.redirect(newUrl)
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, etc)
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
