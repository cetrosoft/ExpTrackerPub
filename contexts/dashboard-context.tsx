"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { useSettings } from "./settings-context"

interface DashboardFilters {
  currency: string
  month: number
  year: number
}

interface DashboardContextType {
  filters: DashboardFilters
  updateFilters: (newFilters: Partial<DashboardFilters>) => void
  setCurrency: (currency: string) => void
  setMonth: (month: number) => void
  setYear: (year: number) => void
  resetToCurrentMonth: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings()
  const [filters, setFilters] = useState<DashboardFilters>({
<<<<<<< HEAD
    currency: "EGP", // Will be updated with default currency from settings
    month: new Date().getMonth() + 1, // Current month
    year: new Date().getFullYear(), // Current year
=======
    currency: "EGP",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
  })

  // Update currency when settings change
  useEffect(() => {
    if (settings?.defaultCurrency) {
      setFilters((prev) => ({
        ...prev,
        currency: settings.defaultCurrency,
      }))
    }
  }, [settings?.defaultCurrency])

  const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
<<<<<<< HEAD
    setFilters((prev) => ({ ...prev, ...newFilters }))
=======
    console.log("Dashboard filters updating:", newFilters)
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters }
      console.log("New dashboard state:", updated)
      return updated
    })
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
  }, [])

  const setCurrency = useCallback(
    (currency: string) => {
<<<<<<< HEAD
=======
      console.log("Setting currency to:", currency)
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
      updateFilters({ currency })
    },
    [updateFilters],
  )

  const setMonth = useCallback(
    (month: number) => {
      updateFilters({ month })
    },
    [updateFilters],
  )

  const setYear = useCallback(
    (year: number) => {
      updateFilters({ year })
    },
    [updateFilters],
  )

  const resetToCurrentMonth = useCallback(() => {
    const now = new Date()
    updateFilters({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    })
  }, [updateFilters])

  const value: DashboardContextType = {
    filters,
    updateFilters,
    setCurrency,
    setMonth,
    setYear,
    resetToCurrentMonth,
  }

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}
