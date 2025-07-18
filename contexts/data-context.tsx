"use client"

import type React from "react"
import { createContext, useContext } from "react"

interface DataContextType {
  apiBaseUrl: string
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

export function DataProvider({ children, apiBaseUrl }: { children: React.ReactNode; apiBaseUrl: string }) {
  return <DataContext.Provider value={{ apiBaseUrl }}>{children}</DataContext.Provider>
}
