"use client"

import { createClient } from "@supabase/supabase-js"
<<<<<<< HEAD
import { useState } from "react"
=======
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

<<<<<<< HEAD
// Singleton pattern to prevent multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

// Hook to use Supabase client
export function useSupabase() {
  const [supabase] = useState(() => getSupabaseClient())

  return { supabase }
}

export const supabase = getSupabaseClient()
=======
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d

// Types for our database
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

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  is_default: boolean
  user_id?: string
  created_at: string
  updated_at: string
}

export interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  exchange_rate: number
  is_default: boolean
  is_active: boolean
  user_id?: string
  created_at: string
  updated_at: string
}

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
<<<<<<< HEAD
=======

// Named export for compatibility
export { supabase as createClient }
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
