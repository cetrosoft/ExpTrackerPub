"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
<<<<<<< HEAD
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange {...props}>
      {children}
    </NextThemesProvider>
  )
=======
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
}
