"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useHydration } from "@/hooks/use-hydration"

interface Settings {
  currency: string
  language: string
  theme: string
  dateFormat: string
  numberFormat: string
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
  isLoading: boolean
}

const defaultSettings: Settings = {
  currency: "USD",
  language: "en",
  theme: "light",
  dateFormat: "MM/dd/yyyy",
  numberFormat: "en-US",
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const isHydrated = useHydration()

  useEffect(() => {
    if (isHydrated) {
      try {
        const savedSettings = localStorage.getItem("expense-tracker-settings")
        if (savedSettings) {
          setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) })
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      }
      setIsLoading(false)
    }
  }, [isHydrated])

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)

    if (isHydrated) {
      try {
        localStorage.setItem("expense-tracker-settings", JSON.stringify(updatedSettings))
      } catch (error) {
        console.error("Error saving settings:", error)
      }
    }
  }

  return <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
