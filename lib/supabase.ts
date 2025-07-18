import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

<<<<<<< HEAD
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
=======
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Named export for compatibility
export { createClient }
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
