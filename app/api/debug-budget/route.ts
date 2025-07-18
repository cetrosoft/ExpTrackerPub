<<<<<<< HEAD
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function GET() {
  try {
    // Get current month dates
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    console.log("Debug period:", periodStart.toISOString().split("T")[0], "to", periodEnd.toISOString().split("T")[0])

    // Get all expenses for current month (without user filter for now)
    const { data: expenses, error: expensesError } = await supabase
      .from("expenses")
      .select("*")
      .gte("date", periodStart.toISOString().split("T")[0])
      .lte("date", periodEnd.toISOString().split("T")[0])
      .order("date", { ascending: false })

    console.log("Expenses query result:", { data: expenses, error: expensesError })

    if (expensesError) {
      console.error("Expenses error:", expensesError)
      return NextResponse.json(
        {
          error: "Failed to fetch expenses",
          details: expensesError.message,
          step: "expenses",
        },
        { status: 500 },
      )
    }

    // Get all budgets (without user filter for now)
    const { data: budgets, error: budgetsError } = await supabase.from("budgets").select("*").eq("is_active", true)

    console.log("Budgets query result:", { data: budgets, error: budgetsError })

    if (budgetsError) {
      console.error("Budgets error:", budgetsError)
      return NextResponse.json(
        {
          error: "Failed to fetch budgets",
          details: budgetsError.message,
          step: "budgets",
        },
        { status: 500 },
      )
    }

    // Get all categories (without user filter for now)
    const { data: categories, error: categoriesError } = await supabase.from("categories").select("*")

    console.log("Categories query result:", { data: categories, error: categoriesError })

    if (categoriesError) {
      console.error("Categories error:", categoriesError)
      return NextResponse.json(
        {
          error: "Failed to fetch categories",
          details: categoriesError.message,
          step: "categories",
        },
        { status: 500 },
      )
    }

    // Simple data return
    const debugData = {
      period: {
        start: periodStart.toISOString().split("T")[0],
        end: periodEnd.toISOString().split("T")[0],
      },
      raw_data: {
        expenses: expenses || [],
        budgets: budgets || [],
        categories: categories || [],
      },
      summary: {
        total_expenses: expenses?.length || 0,
        total_budgets: budgets?.length || 0,
        total_categories: categories?.length || 0,
      },
    }

    console.log("Returning debug data:", debugData)

    return NextResponse.json(debugData, { status: 200 })
  } catch (error: any) {
    console.error("Debug route error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
=======
export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
    }

    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: "Debug failed" }, { status: 500 })
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
  }
}
