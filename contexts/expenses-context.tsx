"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

export interface Expense {
  id: string
  title: string
  amount: number
  category_id: string
  currency_code: string
  date: string
  description?: string
  tags: string[]
  supplier_id?: string
  user_id: string
  created_at: string
  updated_at: string
}

interface ExpensesContextType {
  expenses: Expense[]
  loading: boolean
  addExpense: (expense: Omit<Expense, "id" | "user_id" | "created_at" | "updated_at">) => Promise<void>
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  getExpenseById: (id: string) => Expense | undefined
  getTotalExpenses: () => number
  getExpensesByCategory: () => Record<string, number>
  getExpensesByTags: () => Record<string, number>
  getExpensesByMonth: (month: number, year: number) => Expense[]
  refetch: () => Promise<void>
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined)

export function useExpenses() {
  const context = useContext(ExpensesContext)
  if (!context) {
    throw new Error("useExpenses must be used within an ExpensesProvider")
  }
  return context
}

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const { toast } = useToast()

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch expenses when user changes
  useEffect(() => {
    if (user) {
      fetchExpenses()
    } else {
      setExpenses([])
      setLoading(false)
    }
  }, [user])

  const fetchExpenses = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      console.log("🔍 Fetching ALL expenses for user:", user.id)

      // Try to fetch all records using pagination approach
      let allExpenses: Expense[] = []
      let hasMore = true
      let offset = 0
      const batchSize = 1000

      while (hasMore) {
        console.log(`📦 Fetching batch starting at offset ${offset}`)

        const { data, error } = await supabase
          .from("expenses")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .range(offset, offset + batchSize - 1) // Use range instead of limit

        if (error) throw error

        console.log(`✅ Fetched ${data?.length || 0} expenses in this batch`)

        if (data && data.length > 0) {
          allExpenses = [...allExpenses, ...data]
          offset += batchSize

          // If we got less than batchSize, we've reached the end
          if (data.length < batchSize) {
            hasMore = false
          }
        } else {
          hasMore = false
        }
      }

      console.log(`🎉 Total expenses fetched: ${allExpenses.length} (should be 1260)`)
      setExpenses(allExpenses)
    } catch (error) {
      console.error("Error fetching expenses:", error)
      toast({
        title: "Error",
        description: "Failed to fetch expenses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  const addExpense = useCallback(
    async (expenseData: Omit<Expense, "id" | "user_id" | "created_at" | "updated_at">) => {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be signed in to add expenses",
          variant: "destructive",
        })
        return
      }

      try {
        const expenseId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const newExpense = {
          id: expenseId,
          title: expenseData.title,
          amount: expenseData.amount,
          category_id: expenseData.category_id,
          currency_code: expenseData.currency_code,
          date: expenseData.date,
          description: expenseData.description || null,
          tags: expenseData.tags || [],
          supplier_id: expenseData.supplier_id || null,
          user_id: user.id,
        }

        const { data, error } = await supabase.from("expenses").insert([newExpense]).select().single()

        if (error) throw error

        setExpenses((prev) => [data, ...prev])
        toast({
          title: "Success",
          description: "Expense added successfully",
        })
      } catch (error) {
        console.error("Error adding expense:", error)
        toast({
          title: "Error",
          description: `Failed to add expense: ${error.message || "Unknown error"}`,
          variant: "destructive",
        })
      }
    },
    [user, toast],
  )

  const updateExpense = useCallback(
    async (id: string, expenseData: Partial<Expense>) => {
      try {
        const { data, error } = await supabase
          .from("expenses")
          .update({ ...expenseData, updated_at: new Date().toISOString() })
          .eq("id", id)
          .eq("user_id", user?.id)
          .select()
          .single()

        if (error) throw error

        setExpenses((prev) => prev.map((expense) => (expense.id === id ? data : expense)))
        toast({
          title: "Success",
          description: "Expense updated successfully",
        })
      } catch (error) {
        console.error("Error updating expense:", error)
        toast({
          title: "Error",
          description: "Failed to update expense",
          variant: "destructive",
        })
      }
    },
    [user, toast],
  )

  const deleteExpense = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase.from("expenses").delete().eq("id", id).eq("user_id", user?.id)

        if (error) throw error

        setExpenses((prev) => prev.filter((expense) => expense.id !== id))
        toast({
          title: "Success",
          description: "Expense deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting expense:", error)
        toast({
          title: "Error",
          description: "Failed to delete expense",
          variant: "destructive",
        })
      }
    },
    [user, toast],
  )

  const getExpenseById = useCallback(
    (id: string) => {
      return expenses.find((expense) => expense.id === id)
    },
    [expenses],
  )

  const getTotalExpenses = useCallback(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0)
  }, [expenses])

  const getExpensesByCategory = useCallback(() => {
    return expenses.reduce(
      (acc, expense) => {
        acc[expense.category_id] = (acc[expense.category_id] || 0) + expense.amount
        return acc
      },
      {} as Record<string, number>,
    )
  }, [expenses])

  const getExpensesByTags = useCallback(() => {
    return expenses.reduce(
      (acc, expense) => {
        expense.tags.forEach((tagId) => {
          acc[tagId] = (acc[tagId] || 0) + expense.amount
        })
        return acc
      },
      {} as Record<string, number>,
    )
  }, [expenses])

  const getExpensesByMonth = useCallback(
    (month: number, year: number) => {
      return expenses.filter((expense) => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getMonth() === month - 1 && expenseDate.getFullYear() === year
      })
    },
    [expenses],
  )

  const value: ExpensesContextType = {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenseById,
    getTotalExpenses,
    getExpensesByCategory,
    getExpensesByTags,
    getExpensesByMonth,
    refetch: fetchExpenses,
  }

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>
}
