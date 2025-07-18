"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase-client"

export interface UserSettings {
  language: string
  currency: string
  dateFormat: string
  theme: string
  notifications: {
    enabled: boolean
    expenseReminders: boolean
    budgetAlerts: boolean
    weeklyReports: boolean
    emailNotifications: boolean
    pushNotifications: boolean
  }
  budgetAlerts: {
    alertThreshold: number
    criticalThreshold: number
  }
  currencyDisplay: {
    symbol: string
    decimalPlaces: number
    thousandSeparator: string
  }
  privacy: {
    dataSharing: boolean
    analyticsTracking: boolean
  }
  backup: {
    autoBackup: boolean
    frequency: string
  }
}

interface SettingsContextType {
  settings: UserSettings
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>
  resetSettings: () => Promise<void>
  exportSettings: () => string
  importSettings: (settingsJson: string) => Promise<boolean>
  loading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

const defaultSettings: UserSettings = {
  language: "en",
  currency: "USD",
  dateFormat: "dd_mm_yyyy",
  theme: "light",
  notifications: {
    enabled: true,
    expenseReminders: true,
    budgetAlerts: true,
    weeklyReports: false,
    emailNotifications: false,
    pushNotifications: true,
  },
  budgetAlerts: {
    alertThreshold: 80,
    criticalThreshold: 95,
  },
  currencyDisplay: {
    symbol: "$",
    decimalPlaces: 2,
    thousandSeparator: ",",
  },
  privacy: {
    dataSharing: false,
    analyticsTracking: true,
  },
  backup: {
    autoBackup: false,
    frequency: "weekly",
  },
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  // Fetch settings from database
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        setSettings(defaultSettings)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single()

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "no rows returned" error, which is expected for new users
          console.error("Error fetching settings:", error)
          toast({
            title: "Error",
            description: "Failed to load settings",
            variant: "destructive",
          })
        }

        if (data) {
          // Map database schema to our settings interface
          setSettings({
            language: data.language || defaultSettings.language,
            currency: data.currency || defaultSettings.currency,
            dateFormat: data.date_format || defaultSettings.dateFormat,
            theme: data.theme || defaultSettings.theme,
            notifications: {
              enabled: data.notifications_enabled ?? defaultSettings.notifications.enabled,
              expenseReminders: data.expense_reminders ?? defaultSettings.notifications.expenseReminders,
              budgetAlerts: data.budget_alerts ?? defaultSettings.notifications.budgetAlerts,
              weeklyReports: data.weekly_reports ?? defaultSettings.notifications.weeklyReports,
              emailNotifications: data.email_notifications ?? defaultSettings.notifications.emailNotifications,
              pushNotifications: data.push_notifications ?? defaultSettings.notifications.pushNotifications,
            },
            budgetAlerts: {
              alertThreshold: data.budget_alert_threshold || defaultSettings.budgetAlerts.alertThreshold,
              criticalThreshold: data.budget_critical_threshold || defaultSettings.budgetAlerts.criticalThreshold,
            },
            currencyDisplay: {
              symbol: data.currency_symbol || defaultSettings.currencyDisplay.symbol,
              decimalPlaces: data.decimal_places || defaultSettings.currencyDisplay.decimalPlaces,
              thousandSeparator: data.thousand_separator || defaultSettings.currencyDisplay.thousandSeparator,
            },
            privacy: {
              dataSharing: data.data_sharing ?? defaultSettings.privacy.dataSharing,
              analyticsTracking: data.analytics_tracking ?? defaultSettings.privacy.analyticsTracking,
            },
            backup: {
              autoBackup: data.auto_backup ?? defaultSettings.backup.autoBackup,
              frequency: data.backup_frequency || defaultSettings.backup.frequency,
            },
          })
        } else {
          // No settings found, create default settings
          if (user) {
            const { error: insertError } = await supabase.from("user_settings").insert([
              {
                user_id: user.id,
                language: defaultSettings.language,
                currency: defaultSettings.currency,
                date_format: defaultSettings.dateFormat,
                theme: defaultSettings.theme,
                notifications_enabled: defaultSettings.notifications.enabled,
                budget_alerts: defaultSettings.notifications.budgetAlerts,
                expense_reminders: defaultSettings.notifications.expenseReminders,
                weekly_reports: defaultSettings.notifications.weeklyReports,
                email_notifications: defaultSettings.notifications.emailNotifications,
                push_notifications: defaultSettings.notifications.pushNotifications,
                budget_alert_threshold: defaultSettings.budgetAlerts.alertThreshold,
                budget_critical_threshold: defaultSettings.budgetAlerts.criticalThreshold,
                currency_symbol: defaultSettings.currencyDisplay.symbol,
                decimal_places: defaultSettings.currencyDisplay.decimalPlaces,
                thousand_separator: defaultSettings.currencyDisplay.thousandSeparator,
                data_sharing: defaultSettings.privacy.dataSharing,
                analytics_tracking: defaultSettings.privacy.analyticsTracking,
                auto_backup: defaultSettings.backup.autoBackup,
                backup_frequency: defaultSettings.backup.frequency,
              },
            ])

            if (insertError) {
              console.error("Error creating default settings:", insertError)
            }
          }
          setSettings(defaultSettings)
        }
      } catch (error) {
        console.error("Error in settings fetch:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [user, toast])

  const updateSettings = useCallback(
    async (newSettings: Partial<UserSettings>) => {
      if (!user) return

      try {
        const updatedSettings = { ...settings, ...newSettings }
        setSettings(updatedSettings)

        // Map our settings interface to database schema
        const dbSettings = {
          language: updatedSettings.language,
          currency: updatedSettings.currency,
          date_format: updatedSettings.dateFormat,
          theme: updatedSettings.theme,
          notifications_enabled: updatedSettings.notifications.enabled,
          budget_alerts: updatedSettings.notifications.budgetAlerts,
          expense_reminders: updatedSettings.notifications.expenseReminders,
          weekly_reports: updatedSettings.notifications.weeklyReports,
          email_notifications: updatedSettings.notifications.emailNotifications,
          push_notifications: updatedSettings.notifications.pushNotifications,
          budget_alert_threshold: updatedSettings.budgetAlerts.alertThreshold,
          budget_critical_threshold: updatedSettings.budgetAlerts.criticalThreshold,
          currency_symbol: updatedSettings.currencyDisplay.symbol,
          decimal_places: updatedSettings.currencyDisplay.decimalPlaces,
          thousand_separator: updatedSettings.currencyDisplay.thousandSeparator,
          data_sharing: updatedSettings.privacy.dataSharing,
          analytics_tracking: updatedSettings.privacy.analyticsTracking,
          auto_backup: updatedSettings.backup.autoBackup,
          backup_frequency: updatedSettings.backup.frequency,
        }

        const { error } = await supabase.from("user_settings").update(dbSettings).eq("user_id", user.id)

        if (error) {
          console.error("Error updating settings:", error)
          toast({
            title: "Error",
            description: "Failed to save settings",
            variant: "destructive",
          })
          return
        }

        toast({
          title: "Success",
          description: "Settings saved successfully",
        })
      } catch (error) {
        console.error("Error in settings update:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      }
    },
    [settings, user, toast],
  )

  const resetSettings = useCallback(async () => {
    if (!user) return

    try {
      setSettings(defaultSettings)

      const dbSettings = {
        language: defaultSettings.language,
        currency: defaultSettings.currency,
        date_format: defaultSettings.dateFormat,
        theme: defaultSettings.theme,
        notifications_enabled: defaultSettings.notifications.enabled,
        budget_alerts: defaultSettings.notifications.budgetAlerts,
        expense_reminders: defaultSettings.notifications.expenseReminders,
        weekly_reports: defaultSettings.notifications.weeklyReports,
        email_notifications: defaultSettings.notifications.emailNotifications,
        push_notifications: defaultSettings.notifications.pushNotifications,
        budget_alert_threshold: defaultSettings.budgetAlerts.alertThreshold,
        budget_critical_threshold: defaultSettings.budgetAlerts.criticalThreshold,
        currency_symbol: defaultSettings.currencyDisplay.symbol,
        decimal_places: defaultSettings.currencyDisplay.decimalPlaces,
        thousand_separator: defaultSettings.currencyDisplay.thousandSeparator,
        data_sharing: defaultSettings.privacy.dataSharing,
        analytics_tracking: defaultSettings.privacy.analyticsTracking,
        auto_backup: defaultSettings.backup.autoBackup,
        backup_frequency: defaultSettings.backup.frequency,
      }

      const { error } = await supabase.from("user_settings").update(dbSettings).eq("user_id", user.id)

      if (error) {
        console.error("Error resetting settings:", error)
        toast({
          title: "Error",
          description: "Failed to reset settings",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Settings reset to default",
      })
    } catch (error) {
      console.error("Error in settings reset:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }, [user, toast])

  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2)
  }, [settings])

  const importSettings = useCallback(
    async (settingsJson: string) => {
      try {
        const importedSettings = JSON.parse(settingsJson)
        await updateSettings({ ...defaultSettings, ...importedSettings })
        toast({
          title: "Success",
          description: "Settings imported successfully",
        })
        return true
      } catch (error) {
        console.error("Error importing settings:", error)
        toast({
          title: "Error",
          description: "Invalid settings file",
          variant: "destructive",
        })
        return false
      }
    },
    [updateSettings, toast],
  )

  const value: SettingsContextType = {
    settings,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    loading,
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
