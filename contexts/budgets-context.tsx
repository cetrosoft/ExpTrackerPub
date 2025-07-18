"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/contexts/notifications-context"
import { useToast } from "@/hooks/use-toast"
import { useExpenses } from "@/contexts/expenses-context"
import { useCategories } from "@/contexts/categories-context"

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
  const { addNotification } = useNotifications()
  const { toast } = useToast()

  // Remove these lines:
  // const expensesContext = useExpenses()
  // const categoriesContext = useCategories()
  // const expenses = expensesContext?.expenses || []
  // const categories = categoriesContext?.categories || []

  // Replace with this safer approach:
  let expenses: any[] = []
  let categories: any[] = []

  // Safely get expenses and categories
  try {
    const expensesContext = useExpenses()
    expenses = expensesContext?.expenses || []
  } catch (error) {
    console.log("Expenses context not available, using empty array")
    expenses = []
  }

  try {
    const categoriesContext = useCategories()
    categories = categoriesContext?.categories || []
  } catch (error) {
    console.log("Categories context not available, using empty array")
    categories = []
  }

  // Track which budgets we've already shown notifications for
  const notifiedBudgetsRef = useRef<Record<string, { overBudget: boolean; nearLimit: boolean }>>({})

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

    // Calculate spent amount for current period using actual expenses
    const periodExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      const isInPeriod = expenseDate >= periodStart && expenseDate <= periodEnd
      const isMatchingCategory = expense.category_id === budget.category_id || expense.category === budget.category_id

      return isInPeriod && isMatchingCategory
    })

    const spentAmount = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const remainingAmount = budget.amount - spentAmount
    const percentageUsed = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0
    const isOverBudget = spentAmount > budget.amount
    const isNearLimit = percentageUsed >= budget.alert_threshold && !isOverBudget

    // Find category details
    const category = categories.find((c) => c.id === budget.category_id)

    // Check if we need to show notifications
    const notificationState = notifiedBudgetsRef.current[budget.id] || { overBudget: false, nearLimit: false }

    // Only show over budget notification if we haven't shown it before for this budget
    if (isOverBudget && !notificationState.overBudget) {
      // Show toast notification
      toast({
        title: "Budget Exceeded!",
        description: `Your ${budget.name} budget has exceeded its limit of $${budget.amount.toFixed(2)}`,
        variant: "destructive",
      })

      // Add to notification center
      addNotification({
        title: "Budget Exceeded!",
        message: `Your ${budget.name} budget has exceeded its limit of $${budget.amount.toFixed(2)}`,
        type: "error",
        priority: "high",
      })

      notificationState.overBudget = true
      notifiedBudgetsRef.current[budget.id] = notificationState
    }

    // Only show near limit notification if we haven't shown it before for this budget
    if (isNearLimit && !notificationState.nearLimit && !notificationState.overBudget) {
      // Show toast notification
      toast({
        title: "Budget Alert",
        description: `Your ${budget.name} budget has reached ${percentageUsed.toFixed(0)}% of its limit`,
        variant: "warning",
      })

      // Add to notification center
      addNotification({
        title: "Budget Alert",
        message: `Your ${budget.name} budget has reached ${percentageUsed.toFixed(0)}% of its limit`,
        type: "warning",
        priority: "medium",
      })

      notificationState.nearLimit = true
      notifiedBudgetsRef.current[budget.id] = notificationState
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

      // Show toast notification
      toast({
        title: "Budget Created",
        description: `Your ${budgetData.name} budget has been created successfully`,
      })

      // Add to notification center
      addNotification({
        title: "Budget Created",
        message: `Your ${budgetData.name} budget has been created successfully`,
        type: "success",
        priority: "low",
      })

      await fetchBudgets()
    } catch (error) {
      console.error("Error adding budget:", error)

      // Show toast notification
      toast({
        title: "Error",
        description: "Failed to create budget. Please try again.",
        variant: "destructive",
      })

      // Add to notification center
      addNotification({
        title: "Error",
        message: "Failed to create budget. Please try again.",
        type: "error",
        priority: "high",
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

      // Show toast notification
      toast({
        title: "Budget Updated",
        description: "Your budget has been updated successfully",
      })

      // Add to notification center
      addNotification({
        title: "Budget Updated",
        message: "Your budget has been updated successfully",
        type: "success",
        priority: "low",
      })

      await fetchBudgets()
    } catch (error) {
      console.error("Error updating budget:", error)

      // Show toast notification
      toast({
        title: "Error",
        description: "Failed to update budget. Please try again.",
        variant: "destructive",
      })

      // Add to notification center
      addNotification({
        title: "Error",
        message: "Failed to update budget. Please try again.",
        type: "error",
        priority: "high",
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

      // Show toast notification
      toast({
        title: "Budget Deleted",
        description: "Your budget has been deleted successfully",
      })

      // Add to notification center
      addNotification({
        title: "Budget Deleted",
        message: "Your budget has been deleted successfully",
        type: "success",
        priority: "low",
      })

      await fetchBudgets()
    } catch (error) {
      console.error("Error deleting budget:", error)

      // Show toast notification
      toast({
        title: "Error",
        description: "Failed to delete budget. Please try again.",
        variant: "destructive",
      })

      // Add to notification center
      addNotification({
        title: "Error",
        message: "Failed to delete budget. Please try again.",
        type: "error",
        priority: "high",
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
  }, [])

  // Remove this useEffect:
  // useEffect(() => {
  //   if (user && budgets.length > 0) {
  //     const updateBudgetsWithNewData = async () => {
  //       const updatedBudgets = await Promise.all(budgets.map((budget) => calculateBudgetProgress(budget)))
  //       setBudgets(updatedBudgets)
  //     }
  //     updateBudgetsWithNewData()
  //   }
  // }, [expenses, categories, budgets, user])

  // Replace with this simpler version:
  useEffect(() => {
    if (user && budgets.length > 0) {
      const updateBudgetsWithNewData = async () => {
        const updatedBudgets = await Promise.all(budgets.map((budget) => calculateBudgetProgress(budget)))
        setBudgets(updatedBudgets)
      }
      updateBudgetsWithNewData()
    }
  }, [user])

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
