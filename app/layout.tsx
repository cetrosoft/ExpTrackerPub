import type React from "react"
import type { Metadata } from "next"
<<<<<<< HEAD
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SettingsProvider } from "@/contexts/settings-context"
import { DashboardProvider } from "@/contexts/dashboard-context"

export const metadata: Metadata = {
  title: "Modern Expense Tracker",
  description: "Track your expenses efficiently",
=======
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Modern Expense Tracker",
  description: "Track and manage your expenses with ease",
    generator: 'v0.dev'
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
<<<<<<< HEAD
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <SettingsProvider>
            <DashboardProvider>
              {children}
            </DashboardProvider>
          </SettingsProvider>
=======
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
        </ThemeProvider>
      </body>
    </html>
  )
}
