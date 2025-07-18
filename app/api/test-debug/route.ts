import { NextResponse } from "next/server"
import { getDatabaseAdapter } from "@/server/api/adapters/database-adapter"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const db = await getDatabaseAdapter()
    const expenses = await db.getExpenses(userId)
    const categories = await db.getCategories(userId)
    const tags = await db.getTags(userId)
    const suppliers = await db.getSuppliers(userId)
    const currencies = await db.getCurrencies(userId)
    const budgets = await db.getBudgets(userId)
    const profile = await db.getProfile(userId)

    return NextResponse.json({
      userId,
      expensesCount: expenses.length,
      categoriesCount: categories.length,
      tagsCount: tags.length,
      suppliersCount: suppliers.length,
      currenciesCount: currencies.length,
      budgetsCount: budgets.length,
      profile: profile,
      // Add more debug info as needed
    })
  } catch (error) {
    console.error("Error during debug test:", error)
    return NextResponse.json({ error: "Failed to perform debug test" }, { status: 500 })
  }
}
