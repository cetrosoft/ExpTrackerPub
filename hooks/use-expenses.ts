"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase-client"

export interface Expense {
  id: string
  user_id: string
  title: string
  amount: number
  date: string
  category_id: string
  description?: string
  tags?: string[]
  currency_code: string
  created_at: string
  updated_at: string
}

export function useExpenses() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = useCallback(async () => {
    if (!user?.id) {
      setExpenses([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log(`🔄 [useExpenses] Fetching expenses for user: ${user.id}`)

      const supabase = createClient()

<<<<<<< HEAD
      // Remove ANY limits - fetch ALL expenses
=======
      // Set a very high limit to get ALL records (override default 1000)
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
      const { data, error: fetchError } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
<<<<<<< HEAD
      // NO .limit() call - fetch everything!
=======
        .limit(10000) // Explicitly set high limit to get all records
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d

      if (fetchError) {
        console.error("❌ [useExpenses] Error fetching expenses:", fetchError)
        setError(fetchError.message)
        return
      }

<<<<<<< HEAD
      console.log(`✅ [useExpenses] Successfully fetched ${data?.length || 0} expenses`)
=======
      console.log(`✅ [useExpenses] Successfully fetched ${data?.length || 0} expenses (should be 1260)`)
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
      console.log(
        `📊 [useExpenses] Sample dates: ${data && data.length > 0 ? `${data[data.length - 1].date} to ${data[0].date}` : "No data"}`,
      )

      setExpenses(data || [])
    } catch (err) {
      console.error("❌ [useExpenses] Unexpected error:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const addExpense = useCallback(
    async (expenseData: Omit<Expense, "id" | "user_id" | "created_at" | "updated_at">) => {
      if (!user?.id) throw new Error("User not authenticated")

      const supabase = createClient()
      const now = new Date().toISOString()

      const newExpense = {
        ...expenseData,
        user_id: user.id,
        created_at: now,
        updated_at: now,
      }

      const { data, error } = await supabase.from("expenses").insert([newExpense]).select().single()

      if (error) {
        console.error("❌ [useExpenses] Error adding expense:", error)
        throw error
      }

      console.log("✅ [useExpenses] Added new expense:", data)
      setExpenses((prev) => [data, ...prev])
    },
    [user?.id],
  )

  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
    const supabase = createClient()
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("expenses").update(updatedData).eq("id", id).select().single()

    if (error) {
      console.error("❌ [useExpenses] Error updating expense:", error)
      throw error
    }

    console.log("✅ [useExpenses] Updated expense:", data)
    setExpenses((prev) => prev.map((expense) => (expense.id === id ? data : expense)))
  }, [])

  const deleteExpense = useCallback(async (id: string) => {
    const supabase = createClient()

    const { error } = await supabase.from("expenses").delete().eq("id", id)

    if (error) {
      console.error("❌ [useExpenses] Error deleting expense:", error)
      throw error
    }

    console.log("✅ [useExpenses] Deleted expense:", id)
    setExpenses((prev) => prev.filter((expense) => expense.id !== id))
  }, [])

  const refreshExpenses = useCallback(async () => {
    await fetchExpenses()
  }, [fetchExpenses])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refreshExpenses,
  }
}
