"use client"

import * as React from "react"

interface PageTitleContextType {
  title: string
  setTitle: (title: string) => void
}

const PageTitleContext = React.createContext<PageTitleContextType | undefined>(undefined)

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = React.useState("Dashboard")

  const value = React.useMemo(() => ({ title, setTitle }), [title])

  return <PageTitleContext.Provider value={value}>{children}</PageTitleContext.Provider>
}

export function usePageTitle() {
  const context = React.useContext(PageTitleContext)
  if (context === undefined) {
    throw new Error("usePageTitle must be used within a PageTitleProvider")
  }
  return context
}
