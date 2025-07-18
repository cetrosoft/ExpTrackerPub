"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/contexts/notifications-context"
import { useSettings } from "@/contexts/settings-context"

// Define Budget types here to avoid circular imports
export interface Budget {
  id: string
  user_id: string
  name: string
  amount: number
  category_id: string
  period: "monthly" | "yearly"
  start_date: string
  end_date: string | null
  is_active: boolean
  alert_threshold: number
  rollover_unused: boolean
  created_at: string
  updated_at: string
}

export interface BudgetPeriod {
  id: string
  budget_id: string
  period_start: string
  period_end: string
  allocated_amount: number
  spent_amount: number
  remaining_amount: number
  is_current: boolean
  created_at: string
  updated_at: string
}

export interface BudgetWithDetails extends Budget {
  category?: any
  current_period?: BudgetPeriod
  spent_amount?: number
  remaining_amount?: number
  percentage_used?: number
  is_over_budget?: boolean
  is_near_limit?: boolean
}

// Create a default context value with no-op functions
const defaultContextValue = {
  budgets: [] as BudgetWithDetails[],
  loading: false,
  addBudget: async () => {},
  updateBudget: async () => {},
  deleteBudget: async () => {},
  getBudgetByCategory: () => undefined as BudgetWithDetails | undefined,
  refreshBudgets: async () => {},
  calculateBudgetProgress: async (budget: Budget) => ({ ...budget }) as BudgetWithDetails,
}

export interface BudgetsContextType {
  budgets: BudgetWithDetails[]
  loading: boolean
  addBudget: (budget: Omit<Budget, "id" | "user_id" | "created_at" | "updated_at">) => Promise<void>
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  getBudgetByCategory: (categoryId: string) => BudgetWithDetails | undefined
  refreshBudgets: () => Promise<void>
  calculateBudgetProgress: (budget: Budget) => Promise<BudgetWithDetails>
}

const BudgetsContext = createContext<BudgetsContextType>(defaultContextValue)

export function BudgetsProvider({ children }: { children: React.ReactNode }) {
  const [budgets, setBudgets] = useState<BudgetWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const { addNotification } = useNotifications()
  const { settings } = useSettings()

  // Track which budgets we've already shown notifications for (in-app alerts)
  const notifiedBudgetsRef = useRef<Record<string, { overBudget: boolean; nearLimit: boolean }>>({})

  // Track email notifications sent today per CATEGORY using localStorage
  const getEmailNotificationState = () => {
    try {
      const saved = localStorage.getItem("budgetEmailNotifications")
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }

  const saveEmailNotificationState = (state: any) => {
    try {
      localStorage.setItem("budgetEmailNotifications", JSON.stringify(state))
    } catch (error) {
      console.error("Error saving email state:", error)
    }
  }

  // Helper function to send email notification
  const sendEmailNotification = async (type: string, data: any) => {
    if (!settings?.notifications?.emailNotifications || !user?.email) {
      console.log("Email notifications disabled or no user email")
      return
    }

    try {
      console.log("Sending email notification:", type, "to:", user.email)
      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          data,
          userEmail: user.email,
        }),
      })

      const result = await response.json()
      console.log("Email notification result:", result)
    } catch (error) {
      console.error("Failed to send email notification:", error)
    }
  }

  // Helper function to get expenses for a budget directly from the database
  const getExpensesForBudget = async (budget: Budget, periodStart: Date, periodEnd: Date) => {
    if (!user) return []

    try {
      console.log("=== BUDGET CALCULATION DEBUG ===")
      console.log("Budget:", budget.name, "Category ID:", budget.category_id)
      console.log("Period:", periodStart.toISOString().split("T")[0], "to", periodEnd.toISOString().split("T")[0])
      console.log("User ID:", user.id)

      // Make sure we're only getting expenses with valid dates in the current period
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .eq("category_id", budget.category_id)
        .gte("date", periodStart.toISOString().split("T")[0])
        .lte("date", periodEnd.toISOString().split("T")[0])
        // Add additional filter to exclude future dates beyond today
        .lte("date", new Date().toISOString().split("T")[0])

      if (error) {
        console.error("Error fetching expenses for budget:", error)
        return []
      }

      console.log("Found expenses for budget:", data?.length || 0)
      console.log(
        "Expenses details:",
        data?.map((exp) => ({
          id: exp.id,
          amount: exp.amount,
          date: exp.date,
          created_at: exp.created_at,
          category_id: exp.category_id,
          description: exp.description,
        })),
      )

      // Filter out any expenses with invalid or future dates
      const validExpenses = (data || []).filter((expense) => {
        const expenseDate = new Date(expense.date)
        const today = new Date()
        today.setHours(23, 59, 59, 999) // End of today

        const isValidDate = !isNaN(expenseDate.getTime())
        const isNotFuture = expenseDate <= today
        const isInPeriod = expenseDate >= periodStart && expenseDate <= periodEnd

        console.log(
          `Expense ${expense.id}: date=${expense.date}, valid=${isValidDate}, notFuture=${isNotFuture}, inPeriod=${isInPeriod}`,
        )

        return isValidDate && isNotFuture && isInPeriod
      })

      console.log("Valid expenses after filtering:", validExpenses.length)

      return validExpenses
    } catch (error) {
      console.error("Error in getExpensesForBudget:", error)
      return []
    }
  }

  // Helper function to get category details for a budget
  const getCategoryForBudget = async (categoryId: string) => {
    if (!user || !categoryId) return null

    try {
      const { data, error } = await supabase.from("categories").select("*").eq("id", categoryId).single()

      if (error) {
        console.error("Error fetching category for budget:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in getCategoryForBudget:", error)
      return null
    }
  }

  const shouldSendEmailToday = (categoryId: string, type: "overBudget" | "warning"): boolean => {
    const today = new Date().toISOString().split("T")[0]
    const emailState = getEmailNotificationState()
    const categoryState = emailState[categoryId]

    console.log(`Checking email for category ${categoryId}, type ${type}:`, categoryState)

    if (!categoryState || categoryState.lastEmailDate !== today) {
      return true
    }

    if (type === "overBudget" && categoryState.overBudgetEmailSent) {
      console.log(`Over budget email already sent today for category ${categoryId}`)
      return false
    }

    if (type === "warning" && categoryState.warningEmailSent) {
      console.log(`Warning email already sent today for category ${categoryId}`)
      return false
    }

    return true
  }

  const markEmailAsSent = (categoryId: string, type: "overBudget" | "warning") => {
    const today = new Date().toISOString().split("T")[0]
    const emailState = getEmailNotificationState()

    if (!emailState[categoryId]) {
      emailState[categoryId] = {
        lastEmailDate: today,
        overBudgetEmailSent: false,
        warningEmailSent: false,
      }
    }

    if (type === "overBudget") {
      emailState[categoryId].overBudgetEmailSent = true
    } else {
      emailState[categoryId].warningEmailSent = true
    }

    saveEmailNotificationState(emailState)
    console.log(`Marked ${type} email as sent for category ${categoryId}`)
  }

  const calculateBudgetProgress = async (budget: Budget): Promise<BudgetWithDetails> => {
    const now = new Date()

    // Calculate current period dates
    let periodStart: Date
    let periodEnd: Date

    if (budget.period === "monthly") {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    } else {
      periodStart = new Date(now.getFullYear(), 0, 1)
      periodEnd = new Date(now.getFullYear(), 11, 31)
    }

    // Get expenses for this budget period
    const expenses = await getExpensesForBudget(budget, periodStart, periodEnd)

    // Calculate spent amount with detailed logging
    console.log("=== CALCULATION DEBUG ===")
    console.log("Raw expenses:", expenses)

    const spentAmount = expenses.reduce((sum, expense) => {
      const amount = Number.parseFloat(expense.amount)
      console.log(`Adding expense: ${expense.description || "No description"} - $${amount}`)
      return sum + amount
    }, 0)

    console.log("Total calculated spent amount:", spentAmount)
    console.log("Budget limit:", budget.amount)

    const remainingAmount = budget.amount - spentAmount
    const percentageUsed = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0

    // Get thresholds from settings
    const alertThreshold = settings?.budgetAlerts?.alertThreshold || budget.alert_threshold || 80
    const criticalThreshold = settings?.budgetAlerts?.criticalThreshold || 95

    const isOverBudget = spentAmount > budget.amount
    const isNearLimit = percentageUsed >= alertThreshold && !isOverBudget

    // Find category details
    const category = await getCategoryForBudget(budget.category_id)

    // Check if we need to show notifications
    const notificationState = notifiedBudgetsRef.current[budget.id] || { overBudget: false, nearLimit: false }

    // Check if notifications are enabled in settings
    const notificationsEnabled = settings?.notifications?.enabled
    const budgetAlertsEnabled = settings?.notifications?.budgetAlerts

    console.log("=== NOTIFICATION SETTINGS ===")
    console.log("Notifications enabled:", notificationsEnabled)
    console.log("Budget alerts enabled:", budgetAlertsEnabled)
    console.log("Email notifications enabled:", settings?.notifications?.emailNotifications)

    // Only show notifications if they're enabled in settings
    if (notificationsEnabled && budgetAlertsEnabled) {
      // Only show over budget notification if we haven't shown it before for this budget
      if (isOverBudget && !notificationState.overBudget) {
        // Show toast notification ONLY if push notifications are enabled
        if (settings?.notifications?.pushNotifications !== false) {
          toast({
            title: "Budget Exceeded!",
            description: `Your ${budget.name} budget has exceeded its limit of $${budget.amount.toFixed(2)}`,
            variant: "destructive",
          })
        }

        // Add to notification center ONLY if notifications are enabled
        if (settings?.notifications?.enabled) {
          addNotification({
            title: "Budget Exceeded!",
            message: `Your ${budget.name} budget has exceeded its limit of $${budget.amount.toFixed(2)}`,
            type: "error",
            priority: "high",
          })
        }

        // Send email notification if enabled and not sent today for this category
        if (settings?.notifications?.emailNotifications && shouldSendEmailToday(budget.category_id, "overBudget")) {
          setTimeout(() => {
            sendEmailNotification("budget_exceeded", {
              budgetName: budget.name,
              amount: budget.amount,
              spentAmount: spentAmount,
              categoryName: category?.name || "Unknown Category",
            }).then(() => {
              markEmailAsSent(budget.category_id, "overBudget")
            })
          }, 1000)
        }

        notificationState.overBudget = true
        notifiedBudgetsRef.current[budget.id] = notificationState
      }

      // Similar changes for the warning notification section...
      if (isNearLimit && !notificationState.nearLimit && !notificationState.overBudget) {
        // Show toast notification ONLY if push notifications are enabled
        if (settings?.notifications?.pushNotifications !== false) {
          toast({
            title: "Budget Alert",
            description: `Your ${budget.name} budget has reached ${percentageUsed.toFixed(0)}% of its limit`,
            variant: "warning",
          })
        }

        // Add to notification center ONLY if notifications are enabled
        if (settings?.notifications?.enabled) {
          addNotification({
            title: "Budget Alert",
            message: `Your ${budget.name} budget has reached ${percentageUsed.toFixed(0)}% of its limit`,
            type: "warning",
            priority: "medium",
          })
        }

        if (settings?.notifications?.emailNotifications && shouldSendEmailToday(budget.category_id, "warning")) {
          setTimeout(() => {
            sendEmailNotification("budget_warning", {
              budgetName: budget.name,
              amount: budget.amount,
              spentAmount: spentAmount,
              percentage: percentageUsed,
              categoryName: category?.name || "Unknown Category",
            }).then(() => {
              markEmailAsSent(budget.category_id, "warning")
            })
          }, 2000)
        }

        notificationState.nearLimit = true
        notifiedBudgetsRef.current[budget.id] = notificationState
      }
    } else {
      console.log("Notifications disabled in settings - skipping all notifications")
    }

    return {
      ...budget,
      category,
      spent_amount: spentAmount,
      remaining_amount: remainingAmount,
      percentage_used: percentageUsed,
      is_over_budget: isOverBudget,
      is_near_limit: isNearLimit,
    }
  }

  const fetchBudgets = async () => {
    if (!user) {
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Calculate progress for each budget
      const budgetsWithProgress = await Promise.all((data || []).map((budget) => calculateBudgetProgress(budget)))

      setBudgets(budgetsWithProgress)
    } catch (error) {
      console.error("Error fetching budgets:", error)
      setBudgets([])
    } finally {
      setLoading(false)
    }
  }

  const addBudget = async (budgetData: Omit<Budget, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("budgets")
        .insert([
          {
            ...budgetData,
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Budget Created",
        description: `Your ${budgetData.name} budget has been created successfully`,
      })

      // Add notification for budget creation
      addNotification({
        title: "Budget Created",
        message: `Your ${budgetData.name} budget has been created successfully`,
        type: "success",
        priority: "low",
      })

      await fetchBudgets()
    } catch (error) {
      console.error("Error adding budget:", error)
      toast({
        title: "Error",
        description: "Failed to create budget. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateBudget = async (id: string, budgetData: Partial<Budget>) => {
    try {
      const { error } = await supabase
        .from("budgets")
        .update({
          ...budgetData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      // Reset notification state for this budget since it's been updated
      if (notifiedBudgetsRef.current[id]) {
        notifiedBudgetsRef.current[id] = { overBudget: false, nearLimit: false }
      }

      toast({
        title: "Budget Updated",
        description: "Your budget has been updated successfully",
      })

      // Add notification for budget update
      addNotification({
        title: "Budget Updated",
        message: "Your budget has been updated successfully",
        type: "info",
        priority: "low",
      })

      await fetchBudgets()
    } catch (error) {
      console.error("Error updating budget:", error)
      toast({
        title: "Error",
        description: "Failed to update budget. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase.from("budgets").update({ is_active: false }).eq("id", id)

      if (error) throw error

      // Remove notification state for this budget
      if (notifiedBudgetsRef.current[id]) {
        delete notifiedBudgetsRef.current[id]
      }

      toast({
        title: "Budget Deleted",
        description: "Your budget has been deleted successfully",
      })

      await fetchBudgets()
    } catch (error) {
      console.error("Error deleting budget:", error)
      toast({
        title: "Error",
        description: "Failed to delete budget. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  const getBudgetByCategory = (categoryId: string) => {
    return budgets.find((budget) => budget.category_id === categoryId)
  }

  const refreshBudgets = async () => {
    await fetchBudgets()
  }

  // Reset notification state at the beginning of each month for monthly budgets
  useEffect(() => {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastCheckedMonth = localStorage.getItem("lastCheckedBudgetMonth")

    if (lastCheckedMonth !== firstDayOfMonth.toISOString().slice(0, 7)) {
      // Reset notification state for monthly budgets
      notifiedBudgetsRef.current = {}
      localStorage.setItem("lastCheckedBudgetMonth", firstDayOfMonth.toISOString().slice(0, 7))
    }

    // Reset email notifications daily
    const today = new Date().toISOString().split("T")[0]
    const lastCheckedDay = localStorage.getItem("lastCheckedEmailDay")

    if (lastCheckedDay !== today) {
      // Reset email notification state for new day
      saveEmailNotificationState({})
      localStorage.setItem("lastCheckedEmailDay", today)
    }
  }, [])

  // Fetch budgets when user changes
  useEffect(() => {
    if (user) {
      fetchBudgets()
    }
  }, [user])

  const value = {
    budgets,
    loading,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetByCategory,
    refreshBudgets,
    calculateBudgetProgress,
  }

  return <BudgetsContext.Provider value={value}>{children}</BudgetsContext.Provider>
}

export function useBudgets() {
  const context = useContext(BudgetsContext)
  return context
}
