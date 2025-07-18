import type React from "react"
import { Inter } from "next/font/google"
import { Cairo } from "next/font/google"
import { getDictionary } from "@/lib/dictionaries"
import { Sidebar } from "@/components/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { UserMenu } from "@/components/user-menu"
import { AuthWrapper } from "@/components/auth/auth-wrapper"
import { ExpensesProvider } from "@/contexts/expenses-context"
import { CategoriesProvider } from "@/contexts/categories-context"
import { TagsProvider } from "@/contexts/tags-context"
import { SuppliersProvider } from "@/contexts/suppliers-context"
import { CurrenciesProvider } from "@/contexts/currencies-context"
import { SettingsProvider } from "@/contexts/settings-context"
import { AuthProvider } from "@/contexts/auth-context"
import { ProfileProvider } from "@/contexts/profile-context"
import { DashboardProvider } from "@/contexts/dashboard-context"
import { BudgetsProvider } from "@/contexts/budgets-context"
import { NotificationsProvider } from "@/contexts/notifications-context"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import { DataProvider } from "@/contexts/data-context"
import { config } from "@/lib/config"
import "@/app/globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
})

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "ar" }, { lang: "hi" }]
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  const dictionary = await getDictionary(params.lang)
  const isRtl = params.lang === "ar"
  const isArabic = params.lang === "ar"

  return (
    <html lang={params.lang} dir={isRtl ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className={cn(isArabic ? cairo.className : inter.className, cairo.variable, inter.variable)}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <AuthWrapper>
              <ProfileProvider>
                <SettingsProvider>
                  <DataProvider apiBaseUrl={config.api.baseUrl}>
                    <NotificationsProvider>
                      <CurrenciesProvider>
                        <SuppliersProvider>
                          <TagsProvider>
                            <CategoriesProvider>
                              <BudgetsProvider>
                                <ExpensesProvider>
                                  <DashboardProvider>
                                    <div className="flex min-h-screen">
                                      <Sidebar dictionary={dictionary} lang={params.lang} />
                                      <div className="flex-1 flex flex-col">
                                        <header
                                          className={cn(
                                            "flex items-center justify-end p-4 border-b bg-white",
                                            isRtl && "flex-row-reverse",
                                          )}
                                        >
                                          <div className={cn("flex items-center gap-4", isRtl && "flex-row-reverse")}>
                                            <NotificationCenter />
                                            <UserMenu />
                                          </div>
                                        </header>
                                        <main className="flex-1 p-6 overflow-auto bg-gray-50">{children}</main>
                                      </div>
                                    </div>
                                    <Toaster />
                                  </DashboardProvider>
                                </ExpensesProvider>
                              </BudgetsProvider>
                            </CategoriesProvider>
                          </TagsProvider>
                        </SuppliersProvider>
                      </CurrenciesProvider>
                    </NotificationsProvider>
                  </DataProvider>
                </SettingsProvider>
              </ProfileProvider>
            </AuthWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
