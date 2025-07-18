import type { Database as SupabaseDatabase } from "../supabase/types" // Adjust path if your types are elsewhere

export type Database = SupabaseDatabase

// Base interface for all data types
export interface BaseData {
  id: string
  createdAt: string
  updatedAt: string
  userId?: string | null // Optional, as some might be default or public
  pendingSync?: boolean // For IndexedDB to track unsynced changes
  pendingDelete?: boolean // For IndexedDB to track items to be deleted from remote
}

export type Expense = Database["public"]["Tables"]["expenses"]["Row"] & BaseData
export type Category = Database["public"]["Tables"]["categories"]["Row"] & BaseData
export type Tag = Database["public"]["Tables"]["tags"]["Row"] & BaseData
export type Supplier = Database["public"]["Tables"]["suppliers"]["Row"] & BaseData
export type Budget = Database["public"]["Tables"]["budgets"]["Row"] & BaseData
export type Currency = Database["public"]["Tables"]["currencies"]["Row"] & BaseData
export type Profile = Database["public"]["Tables"]["profiles"]["Row"] & BaseData
export type Settings = Database["public"]["Tables"]["settings"]["Row"] & BaseData
export type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"] & BaseData

export interface Notification extends BaseData {
  title: string
  message: string
  read: boolean
  type: "info" | "warning" | "error" | "success" | "budget"
  link?: string | null
}

export interface Setting extends BaseData {
  id: string // e.g., "defaultCurrency", "theme", "language"
  value: any // Can be string, number, boolean, object
}

// Define the structure of your Supabase database types here
// This is a placeholder and should be replaced with your actual types
// generated from Supabase CLI (e.g., `supabase gen types typescript --project-id "your-project-id" --schema public > lib/database.types.ts`)
declare global {
  namespace Supabase {
    interface Public {
      Tables: {
        expenses: {
          Row: {
            id: string
            user_id: string
            amount: number
            description: string | null
            date: string
            category_id: string | null
            tag_ids: string[] | null
            supplier_id: string | null
            currency_id: string | null
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            user_id: string
            amount: number
            description?: string | null
            date: string
            category_id?: string | null
            tag_ids?: string[] | null
            supplier_id?: string | null
            currency_id?: string | null
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            user_id?: string
            amount?: number
            description?: string | null
            date?: string
            category_id?: string | null
            tag_ids?: string[] | null
            supplier_id?: string | null
            currency_id?: string | null
            created_at?: string
            updated_at?: string
          }
        }
        categories: {
          Row: {
            id: string
            user_id: string
            name: string
            icon: string | null
            color: string | null
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            user_id: string
            name: string
            icon?: string | null
            color?: string | null
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            user_id?: string
            name?: string
            icon?: string | null
            color?: string | null
            created_at?: string
            updated_at?: string
          }
        }
        tags: {
          Row: {
            id: string
            user_id: string
            name: string
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            user_id: string
            name: string
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            user_id?: string
            name?: string
            created_at?: string
            updated_at?: string
          }
        }
        suppliers: {
          Row: {
            id: string
            user_id: string
            name: string
            contact_info: string | null
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            user_id: string
            name: string
            contact_info?: string | null
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            user_id?: string
            name?: string
            contact_info?: string | null
            created_at?: string
            updated_at?: string
          }
        }
        budgets: {
          Row: {
            id: string
            user_id: string
            name: string
            amount: number
            spent_amount: number
            start_date: string
            end_date: string
            category_id: string | null
            currency_id: string | null
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            user_id: string
            name: string
            amount: number
            spent_amount?: number
            start_date: string
            end_date: string
            category_id?: string | null
            currency_id?: string | null
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            user_id?: string
            name?: string
            amount?: number
            spent_amount?: number
            start_date?: string
            end_date?: string
            category_id?: string | null
            currency_id?: string | null
            created_at?: string
            updated_at?: string
          }
        }
        currencies: {
          Row: {
            id: string
            user_id: string
            name: string
            code: string
            symbol: string
            is_default: boolean
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            user_id: string
            name: string
            code: string
            symbol: string
            is_default?: boolean
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            user_id?: string
            name?: string
            code?: string
            symbol?: string
            is_default?: boolean
            created_at?: string
            updated_at?: string
          }
        }
        profiles: {
          Row: {
            id: string
            username: string | null
            avatar_url: string | null
            full_name: string | null
            updated_at: string | null
          }
          Insert: {
            id: string
            username?: string | null
            avatar_url?: string | null
            full_name?: string | null
            updated_at?: string | null
          }
          Update: {
            id?: string
            username?: string | null
            avatar_url?: string | null
            full_name?: string | null
            updated_at?: string | null
          }
        }
        settings: {
          Row: {
            id: string
            user_id: string
            theme: string
            default_currency_id: string | null
            language: string
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            user_id: string
            theme?: string
            default_currency_id?: string | null
            language?: string
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            user_id?: string
            theme?: string
            default_currency_id?: string | null
            language?: string
            created_at?: string
            updated_at?: string
          }
        }
        user_settings: {
          Row: {
            id: string
            user_id: string
            setting_key: string
            setting_value: string
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            user_id: string
            setting_key: string
            setting_value: string
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            user_id?: string
            setting_key?: string
            setting_value?: string
            created_at?: string
            updated_at?: string
          }
        }
      }
      Views: {
        [_ in never]: never
      }
      Functions: {
        [_ in never]: never
      }
      Enums: {
        [_ in never]: never
      }
      CompositeTypes: {
        [_ in never]: never
      }
    }
  }
}
