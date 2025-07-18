"use client"

import type React from "react"
<<<<<<< HEAD
import { createContext, useContext } from "react"

interface DataContextType {
  apiBaseUrl: string
=======
import { createContext, useContext, useEffect, useState } from "react"
import DataService, { type Expense } from "../lib/data-service"

interface DataContextType {
  expenses: Expense[]
  isLoading: boolean
  error: Error | null
  refreshExpenses: () => Promise<void>
  getExpenseById: (id: string) => Promise<Expense | undefined>
  saveExpense: (expense: Omit<Expense, "id" | "synced" | "updatedAt">) => Promise<Expense>
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<Expense>
  deleteExpense: (id: string) => Promise<void>
  isOnline: boolean
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
}

const DataContext = createContext<DataContextType | undefined>(undefined)

<<<<<<< HEAD
export function useData() {
=======
export const useData = () => {
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

<<<<<<< HEAD
export function DataProvider({ children, apiBaseUrl }: { children: React.ReactNode; apiBaseUrl: string }) {
  return <DataContext.Provider value={{ apiBaseUrl }}>{children}</DataContext.Provider>
=======
interface DataProviderProps {
  children: React.ReactNode
  apiBaseUrl: string
}

export const DataProvider: React.FC<DataProviderProps> = ({ children, apiBaseUrl }) => {
  const [dataService] = useState(() => new DataService(apiBaseUrl))
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      refreshExpenses()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Initial data load
    refreshExpenses()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      dataService.dispose()
    }
  }, [])

  const refreshExpenses = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await dataService.getExpenses()
      setExpenses(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }

  const getExpenseById = async (id: string) => {
    return dataService.getExpenseById(id)
  }

  const saveExpense = async (expense: Omit<Expense, "id" | "synced" | "updatedAt">) => {
    const newExpense = await dataService.saveExpense(expense)
    await refreshExpenses()
    return newExpense
  }

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    const updatedExpense = await dataService.updateExpense(id, updates)
    await refreshExpenses()
    return updatedExpense
  }

  const deleteExpense = async (id: string) => {
    await dataService.deleteExpense(id)
    await refreshExpenses()
  }

  const value: DataContextType = {
    expenses,
    isLoading,
    error,
    refreshExpenses,
    getExpenseById,
    saveExpense,
    updateExpense,
    deleteExpense,
    isOnline,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
}
