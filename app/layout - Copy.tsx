import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { SettingsProvider } from "@/contexts/settings-context"
import { DashboardProvider } from "@/contexts/dashboard-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Modern Expense Tracker",
  description: "Track your expenses efficiently",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SettingsProvider>
              <DashboardProvider>{children}</DashboardProvider>
            </SettingsProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
