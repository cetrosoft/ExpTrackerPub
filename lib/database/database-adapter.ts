import { supabaseServer } from "@/lib/supabase-server"

export interface DatabaseAdapter {
  getExpenses(userId: string): Promise<any[]>
  addExpense(expense: any): Promise<any>
  deleteExpense(id: string): Promise<void>
  getCategories(userId?: string): Promise<any[]>
  getCurrencies(userId?: string): Promise<any[]>
}

class SupabaseDatabaseAdapter implements DatabaseAdapter {
  async getExpenses(userId: string) {
    const { data, error } = await supabaseServer
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })

    if (error) throw error
    return data || []
  }

  async addExpense(expense: any) {
    const { data, error } = await supabaseServer.from("expenses").insert(expense).select().single()

    if (error) throw error
    return data
  }

  async deleteExpense(id: string) {
    const { error } = await supabaseServer.from("expenses").delete().eq("id", id)

    if (error) throw error
  }

  async getCategories(userId?: string) {
    let query = supabaseServer.from("categories").select("*")

    if (userId) {
      query = query.or(`user_id.eq.${userId},is_default.eq.true`)
    } else {
      query = query.eq("is_default", true)
    }

    const { data, error } = await query.order("name")

    if (error) throw error
    return data || []
  }

  async getCurrencies(userId?: string) {
    let query = supabaseServer.from("currencies").select("*")

    if (userId) {
      query = query.or(`user_id.eq.${userId},is_default.eq.true`)
    } else {
      query = query.eq("is_default", true)
    }

    const { data, error } = await query.eq("is_active", true).order("name")

    if (error) throw error
    return data || []
  }
}

export function createDatabaseAdapter(): DatabaseAdapter {
  return new SupabaseDatabaseAdapter()
}
