"use client"

import type * as React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthWrapper } from "@/components/auth/auth-wrapper"
import { DataProvider } from "@/contexts/data-context"
import { ProfileProvider } from "@/contexts/profile-context"
import { SettingsProvider } from "@/contexts/settings-context"
import { CurrenciesProvider } from "@/contexts/currencies-context"
import { CategoriesProvider } from "@/contexts/categories-context"
import { TagsProvider } from "@/contexts/tags-context"
import { SuppliersProvider } from "@/contexts/suppliers-context"
import { ExpensesProvider } from "@/contexts/expenses-context"
import { BudgetsProvider } from "@/contexts/budgets-context"
import { NotificationsProvider } from "@/contexts/notifications-context"
import { DashboardProvider } from "@/contexts/dashboard-context"
import { PageTitleProvider } from "@/contexts/page-title-context"
import { Toaster } from "@/components/ui/toaster"
import { Sidebar } from "@/components/sidebar"
import { HeaderTitle } from "@/components/header-title"
import { UserMenu } from "@/components/user-menu"
import { LanguageSwitcher } from "@/components/language-switcher"
import { SyncStatus } from "@/components/sync-status"
import { OfflineIndicator } from "@/components/offline-indicator"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"
import { NotificationCenter } from "@/components/notifications/notification-center" // Corrected import path
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface ClientLayoutWrapperProps {
  children: React.ReactNode
  dictionary: any
}

export function ClientLayoutWrapper({ children, dictionary }: ClientLayoutWrapperProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthWrapper>
        <DataProvider>
          <ProfileProvider>
            <SettingsProvider>
              <CurrenciesProvider>
                <CategoriesProvider>
                  <TagsProvider>
                    <SuppliersProvider>
                      <ExpensesProvider>
                        <BudgetsProvider>
                          <NotificationsProvider>
                            <DashboardProvider>
                              <PageTitleProvider>
                                <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                                  <Sidebar dictionary={dictionary} />
                                  <div className="flex flex-col">
                                    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                                      <Sheet>
                                        <SheetTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="shrink-0 md:hidden bg-transparent"
                                          >
                                            <Menu className="h-5 w-5" />
                                            <span className="sr-only">Toggle navigation menu</span>
                                          </Button>
                                        </SheetTrigger>
                                        <SheetContent side="left" className="flex flex-col">
                                          <Sidebar dictionary={dictionary} />
                                        </SheetContent>
                                      </Sheet>
                                      <HeaderTitle />
                                      <div className="w-full flex-1">{/* Search or other header elements */}</div>
                                      <SyncStatus dictionary={dictionary} />
                                      <LanguageSwitcher dictionary={dictionary} />
                                      <NotificationCenter dictionary={dictionary} /> {/* Insert NotificationCenter */}
                                      <UserMenu dictionary={dictionary} />
                                    </header>
                                    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
                                  </div>
                                </div>
                                <OfflineIndicator dictionary={dictionary} />
                                <ServiceWorkerRegistration dictionary={dictionary} />
                                <Toaster />
                              </PageTitleProvider>
                            </DashboardProvider>
                          </NotificationsProvider>
                        </BudgetsProvider>
                      </ExpensesProvider>
                    </SuppliersProvider>
                  </TagsProvider>
                </CategoriesProvider>
              </CurrenciesProvider>
            </SettingsProvider>
          </ProfileProvider>
        </DataProvider>
      </AuthWrapper>
    </ThemeProvider>
  )
}
