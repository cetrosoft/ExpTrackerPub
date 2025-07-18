import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

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
  }
}
