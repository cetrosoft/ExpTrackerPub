"use client"

import type React from "react"
<<<<<<< HEAD
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"
=======
import { createContext, useContext, useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d

export interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  exchangeRate: number
  isDefault: boolean
  isActive: boolean
<<<<<<< HEAD
  createdAt?: string
  updatedAt?: string
=======
  createdAt: string
  updatedAt: string
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
}

interface CurrenciesContextType {
  currencies: Currency[]
<<<<<<< HEAD
  isLoading: boolean
  addCurrency: (currency: Omit<Currency, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateCurrency: (id: string, currency: Partial<Currency>) => Promise<void>
  deleteCurrency: (id: string) => Promise<void>
=======
  addCurrency: (currency: Omit<Currency, "id" | "createdAt" | "updatedAt">) => void
  updateCurrency: (id: string, currency: Partial<Currency>) => void
  deleteCurrency: (id: string) => void
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
  getCurrencyById: (id: string) => Currency | undefined
  getCurrencyByCode: (code: string) => Currency | undefined
  getActiveCurrencies: () => Currency[]
  getDefaultCurrency: () => Currency | undefined
<<<<<<< HEAD
  setDefaultCurrency: (id: string) => Promise<void>
=======
  setDefaultCurrency: (id: string) => void
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
}

const CurrenciesContext = createContext<CurrenciesContextType | undefined>(undefined)

export function useCurrencies() {
  const context = useContext(CurrenciesContext)
  if (!context) {
    throw new Error("useCurrencies must be used within a CurrenciesProvider")
  }
  return context
}

<<<<<<< HEAD
// Helper function to convert database format to frontend format
function dbToFrontend(dbCurrency: any): Currency {
  return {
    id: dbCurrency.id,
    code: dbCurrency.code,
    name: dbCurrency.name,
    symbol: dbCurrency.symbol,
    exchangeRate: Number(dbCurrency.exchange_rate) || 1.0,
    isDefault: dbCurrency.is_default || false,
    isActive: dbCurrency.is_active !== false,
    createdAt: dbCurrency.created_at,
    updatedAt: dbCurrency.updated_at,
  }
}

// Helper function to convert frontend format to database format
function frontendToDb(frontendCurrency: Partial<Currency>) {
  const dbCurrency: any = {}

  if (frontendCurrency.code !== undefined) dbCurrency.code = frontendCurrency.code
  if (frontendCurrency.name !== undefined) dbCurrency.name = frontendCurrency.name
  if (frontendCurrency.symbol !== undefined) dbCurrency.symbol = frontendCurrency.symbol
  if (frontendCurrency.exchangeRate !== undefined) dbCurrency.exchange_rate = frontendCurrency.exchangeRate
  if (frontendCurrency.isDefault !== undefined) dbCurrency.is_default = frontendCurrency.isDefault
  if (frontendCurrency.isActive !== undefined) dbCurrency.is_active = frontendCurrency.isActive

  return dbCurrency
}

export function CurrenciesProvider({ children }: { children: React.ReactNode }) {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { supabase } = useSupabase()
  const { user } = useAuth()

  // Fetch currencies from Supabase
  useEffect(() => {
    async function fetchCurrencies() {
      try {
        setIsLoading(true)
        console.log("Fetching currencies")

        // Get all currencies (default and user-specific)
        let query = supabase.from("currencies").select("*").order("code", { ascending: true })

        if (user) {
          // Get default currencies and user's custom currencies
          query = query.or(`user_id.is.null,user_id.eq.${user.id}`)
        } else {
          // Only get default currencies if no user
          query = query.is("user_id", null)
        }

        const { data, error } = await query

        if (error) {
          console.error("Error fetching currencies:", error)
          toast({
            title: "Error",
            description: "Failed to load currencies",
            variant: "destructive",
          })
          return
        }

        // Convert to frontend format
        const allCurrencies = (data || []).map(dbToFrontend)

        console.log("Fetched currencies:", allCurrencies)
        setCurrencies(allCurrencies)
      } catch (error) {
        console.error("Error in fetchCurrencies:", error)
        toast({
          title: "Error",
          description: "Failed to load currencies",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrencies()
  }, [supabase, user, toast])

  const addCurrency = useCallback(
    async (currencyData: Omit<Currency, "id" | "createdAt" | "updatedAt">) => {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be signed in to add custom currencies",
=======
// Sample currencies for demonstration
const sampleCurrencies: Currency[] = [
  {
    id: "usd",
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    exchangeRate: 1.0,
    isDefault: false,
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "egp",
    code: "EGP",
    name: "Egyptian Pound",
    symbol: "LE",
    exchangeRate: 30.5,
    isDefault: true,
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "eur",
    code: "EUR",
    name: "Euro",
    symbol: "€",
    exchangeRate: 0.85,
    isDefault: false,
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "gbp",
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    exchangeRate: 0.73,
    isDefault: false,
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "inr",
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    exchangeRate: 83.2,
    isDefault: false,
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
]

export function CurrenciesProvider({ children }: { children: React.ReactNode }) {
  const [currencies, setCurrencies] = useState<Currency[]>(sampleCurrencies)
  const { toast } = useToast()

  const addCurrency = useCallback(
    (currencyData: Omit<Currency, "id" | "createdAt" | "updatedAt">) => {
      // Check if currency code already exists
      const existingCurrency = currencies.find(
        (currency) => currency.code.toLowerCase() === currencyData.code.toLowerCase(),
      )

      if (existingCurrency) {
        toast({
          title: "Error",
          description: "A currency with this code already exists",
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
          variant: "destructive",
        })
        return
      }

<<<<<<< HEAD
      try {
        // Check if currency code already exists
        const existingCurrency = currencies.find(
          (currency) => currency.code.toLowerCase() === currencyData.code.toLowerCase(),
=======
      const newCurrency: Currency = {
        ...currencyData,
        id: `currency_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setCurrencies((prev) => [...prev, newCurrency])
      toast({
        title: "Success",
        description: "Currency added successfully",
      })
    },
    [currencies, toast],
  )

  const updateCurrency = useCallback(
    (id: string, currencyData: Partial<Currency>) => {
      // Check if new code conflicts with existing currencies
      if (currencyData.code) {
        const existingCurrency = currencies.find(
          (currency) => currency.id !== id && currency.code.toLowerCase() === currencyData.code.toLowerCase(),
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
        )

        if (existingCurrency) {
          toast({
            title: "Error",
            description: "A currency with this code already exists",
            variant: "destructive",
          })
          return
        }
<<<<<<< HEAD

        const dbCurrency = {
          ...frontendToDb(currencyData),
          user_id: user.id,
        }

        console.log("Adding currency:", dbCurrency)
        const { data, error } = await supabase.from("currencies").insert(dbCurrency).select().single()

        if (error) {
          console.error("Error adding currency:", error)
          toast({
            title: "Error",
            description: `Failed to add currency: ${error.message}`,
            variant: "destructive",
          })
          return
        }

        const newCurrency = dbToFrontend(data)
        console.log("Currency added:", newCurrency)
        setCurrencies((prev) => [...prev, newCurrency])
        toast({
          title: "Success",
          description: "Currency added successfully",
        })
      } catch (error) {
        console.error("Error in addCurrency:", error)
        toast({
          title: "Error",
          description: "Failed to add currency",
          variant: "destructive",
        })
      }
    },
    [currencies, toast, supabase, user],
  )

  const updateCurrency = useCallback(
    async (id: string, currencyData: Partial<Currency>) => {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be signed in to update currencies",
          variant: "destructive",
        })
        return
      }

      try {
        const currency = currencies.find((c) => c.id === id)

        if (!currency) {
          toast({
            title: "Error",
            description: "Currency not found",
            variant: "destructive",
          })
          return
        }

        // Check if this is a default currency (user_id is null)
        if (!currency.createdAt || !user) {
          toast({
            title: "Error",
            description: "Cannot modify default currencies",
            variant: "destructive",
          })
          return
        }

        // Check if new code conflicts with existing currencies
        if (currencyData.code) {
          const existingCurrency = currencies.find(
            (currency) => currency.id !== id && currency.code.toLowerCase() === currencyData.code.toLowerCase(),
          )

          if (existingCurrency) {
            toast({
              title: "Error",
              description: "A currency with this code already exists",
              variant: "destructive",
            })
            return
          }
        }

        const updates = {
          ...frontendToDb(currencyData),
          updated_at: new Date().toISOString(),
        }

        console.log("Updating currency:", id, updates)

        // Use update without .single() to avoid the multiple rows error
        const { data, error } = await supabase
          .from("currencies")
          .update(updates)
          .eq("id", id)
          .eq("user_id", user.id) // Ensure user can only update their own currencies
          .select()

        if (error) {
          console.error("Error updating currency:", error)
          toast({
            title: "Error",
            description: `Failed to update currency: ${error.message}`,
            variant: "destructive",
          })
          return
        }

        if (!data || data.length === 0) {
          toast({
            title: "Error",
            description: "Currency not found or you don't have permission to update it",
            variant: "destructive",
          })
          return
        }

        const updatedCurrency = dbToFrontend(data[0])
        console.log("Currency updated:", updatedCurrency)
        setCurrencies((prev) => prev.map((currency) => (currency.id === id ? updatedCurrency : currency)))
        toast({
          title: "Success",
          description: "Currency updated successfully",
        })
      } catch (error) {
        console.error("Error in updateCurrency:", error)
        toast({
          title: "Error",
          description: "Failed to update currency",
          variant: "destructive",
        })
      }
    },
    [currencies, toast, supabase, user],
  )

  const deleteCurrency = useCallback(
    async (id: string) => {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be signed in to delete currencies",
=======
      }

      setCurrencies((prev) =>
        prev.map((currency) =>
          currency.id === id ? { ...currency, ...currencyData, updatedAt: new Date().toISOString() } : currency,
        ),
      )

      toast({
        title: "Success",
        description: "Currency updated successfully",
      })
    },
    [currencies, toast],
  )

  const deleteCurrency = useCallback(
    (id: string) => {
      const currency = currencies.find((c) => c.id === id)
      if (currency?.isDefault) {
        toast({
          title: "Error",
          description: "Cannot delete the default currency",
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
          variant: "destructive",
        })
        return
      }

<<<<<<< HEAD
      try {
        const currency = currencies.find((c) => c.id === id)

        if (!currency) {
          toast({
            title: "Error",
            description: "Currency not found",
            variant: "destructive",
          })
          return
        }

        // Check if this is a default currency
        if (currency.isDefault) {
          toast({
            title: "Error",
            description: "Cannot delete the default currency",
            variant: "destructive",
          })
          return
        }

        console.log("Deleting currency:", id)
        const { error } = await supabase.from("currencies").delete().eq("id", id).eq("user_id", user.id) // Ensure user can only delete their own currencies

        if (error) {
          console.error("Error deleting currency:", error)
          toast({
            title: "Error",
            description: `Failed to delete currency: ${error.message}`,
            variant: "destructive",
          })
          return
        }

        setCurrencies((prev) => prev.filter((currency) => currency.id !== id))
        toast({
          title: "Success",
          description: "Currency deleted successfully",
        })
      } catch (error) {
        console.error("Error in deleteCurrency:", error)
        toast({
          title: "Error",
          description: "Failed to delete currency",
          variant: "destructive",
        })
      }
    },
    [currencies, toast, supabase, user],
=======
      setCurrencies((prev) => prev.filter((currency) => currency.id !== id))
      toast({
        title: "Success",
        description: "Currency deleted successfully",
      })
    },
    [currencies, toast],
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
  )

  const getCurrencyById = useCallback(
    (id: string) => {
      return currencies.find((currency) => currency.id === id)
    },
    [currencies],
  )

  const getCurrencyByCode = useCallback(
    (code: string) => {
      return currencies.find((currency) => currency.code.toLowerCase() === code.toLowerCase())
    },
    [currencies],
  )

  const getActiveCurrencies = useCallback(() => {
    return currencies.filter((currency) => currency.isActive)
  }, [currencies])

  const getDefaultCurrency = useCallback(() => {
    return currencies.find((currency) => currency.isDefault)
  }, [currencies])

  const setDefaultCurrency = useCallback(
<<<<<<< HEAD
    async (id: string) => {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be signed in to change the default currency",
          variant: "destructive",
        })
        return
      }

      try {
        // First, update all user currencies to not be default
        const { error: updateError } = await supabase
          .from("currencies")
          .update({ is_default: false, updated_at: new Date().toISOString() })
          .eq("user_id", user.id)

        if (updateError) {
          console.error("Error resetting default currencies:", updateError)
          toast({
            title: "Error",
            description: `Failed to update currencies: ${updateError.message}`,
            variant: "destructive",
          })
          return
        }

        // Then set the selected currency as default
        const { error } = await supabase
          .from("currencies")
          .update({ is_default: true, updated_at: new Date().toISOString() })
          .eq("id", id)
          .eq("user_id", user.id)

        if (error) {
          console.error("Error setting default currency:", error)
          toast({
            title: "Error",
            description: `Failed to set default currency: ${error.message}`,
            variant: "destructive",
          })
          return
        }

        // Update local state
        setCurrencies((prev) =>
          prev.map((currency) => ({
            ...currency,
            isDefault: currency.id === id,
          })),
        )

        toast({
          title: "Success",
          description: "Default currency updated successfully",
        })
      } catch (error) {
        console.error("Error in setDefaultCurrency:", error)
        toast({
          title: "Error",
          description: "Failed to update default currency",
          variant: "destructive",
        })
      }
    },
    [toast, supabase, user],
=======
    (id: string) => {
      setCurrencies((prev) =>
        prev.map((currency) => ({
          ...currency,
          isDefault: currency.id === id,
          updatedAt: new Date().toISOString(),
        })),
      )

      toast({
        title: "Success",
        description: "Default currency updated successfully",
      })
    },
    [toast],
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
  )

  const value: CurrenciesContextType = {
    currencies,
<<<<<<< HEAD
    isLoading,
=======
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
    addCurrency,
    updateCurrency,
    deleteCurrency,
    getCurrencyById,
    getCurrencyByCode,
    getActiveCurrencies,
    getDefaultCurrency,
    setDefaultCurrency,
  }

  return <CurrenciesContext.Provider value={value}>{children}</CurrenciesContext.Provider>
}
