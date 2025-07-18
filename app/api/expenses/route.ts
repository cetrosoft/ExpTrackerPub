<<<<<<< HEAD
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { data: expenses, error } = await supabase
      .from("expenses")
      .select(`
        *,
        categories(name, color, icon),
        suppliers(name)
      `)
      .eq("user_id", userId)
      .order("date", { ascending: false })

    if (error) {
      console.error("Error fetching expenses:", error)
      return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
    }

    return NextResponse.json(expenses)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const expense = await request.json()

    const { data, error } = await supabase.from("expenses").insert([expense]).select().single()

    if (error) {
      console.error("Error creating expense:", error)
      return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  try {
    const expense = await request.json()
    const { id, ...updateData } = expense

    const { data, error } = await supabase
      .from("expenses")
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating expense:", error)
      return NextResponse.json({ error: "Failed to update expense" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Expense ID required" }, { status: 400 })
    }

    const { error } = await supabase.from("expenses").delete().eq("id", id)

    if (error) {
      console.error("Error deleting expense:", error)
      return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
=======
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    // Remove any limit to fetch ALL expenses
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
    // No .limit() call - fetch everything

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Enhanced logging to track what we're actually returning
    console.log(`✅ Successfully fetched ${data.length} expenses for user ${userId}`)
    console.log(`📊 Date range: ${data.length > 0 ? `${data[data.length - 1].date} to ${data[0].date}` : "No data"}`)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("❌ Server error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, title, amount, date, category_id, description, tags, currency_code } = body

    if (!user_id || !title || !amount || !date || !category_id) {
      return NextResponse.json(
        { error: "Missing required fields: user_id, title, amount, date, category_id" },
        { status: 400 },
      )
    }

    const supabase = createClient()

    const expense = {
      id: uuidv4(),
      user_id,
      title,
      amount,
      date,
      category_id,
      description: description || "",
      tags: tags || [],
      currency_code: currency_code || "USD",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("expenses").insert([expense]).select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
  }
}
