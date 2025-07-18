import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SettingsProvider } from "@/contexts/settings-context"
import { DashboardProvider } from "@/contexts/dashboard-context"

export const metadata: Metadata = {
  title: "Modern Expense Tracker",
  description: "Track your expenses efficiently",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <SettingsProvider>
            <DashboardProvider>
              {children}
            </DashboardProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
