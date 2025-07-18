<<<<<<< HEAD
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
=======
import { type NextRequest, NextResponse } from "next/server"
import { createDatabaseAdapter } from "@/lib/database/database-adapter"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

<<<<<<< HEAD
    let query = supabase.from("currencies").select("*").eq("is_active", true).order("is_default", { ascending: false })

    // Get default currencies and user-specific currencies
    if (userId) {
      query = query.or(`user_id.is.null,user_id.eq.${userId}`)
    } else {
      query = query.is("user_id", null)
    }

    const { data: currencies, error } = await query

    if (error) {
      console.error("Error fetching currencies:", error)
      return NextResponse.json({ error: "Failed to fetch currencies" }, { status: 500 })
    }

    return NextResponse.json(currencies)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
=======
    const adapter = createDatabaseAdapter()
    const currencies = await adapter.getCurrencies(userId || undefined)

    return NextResponse.json(currencies)
  } catch (error) {
    console.error("Error fetching currencies:", error)
    return NextResponse.json({ error: "Failed to fetch currencies" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, symbol, exchange_rate } = body

    if (!code || !name || !symbol || !exchange_rate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const adapter = createDatabaseAdapter()
    const { data: currency, error } = await adapter.insertCurrency({
      code,
      name,
      symbol,
      exchange_rate,
      is_default: false,
      is_active: true,
    })

    if (error) {
      console.error("Error creating currency:", error)
      return NextResponse.json({ error: "Failed to create currency" }, { status: 500 })
    }

    return NextResponse.json(currency, { status: 201 })
  } catch (error) {
    console.error("Error creating currency:", error)
    return NextResponse.json({ error: "Failed to create currency" }, { status: 500 })
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
  }
}
