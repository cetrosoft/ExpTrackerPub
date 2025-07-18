import { NextResponse } from "next/server"
import { getDatabaseAdapter } from "@/server/api/adapters/database-adapter"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const budgetId = searchParams.get("budgetId")

  if (!userId || !budgetId) {
    return NextResponse.json({ error: "User ID and Budget ID are required" }, { status: 400 })
  }

  try {
    const db = await getDatabaseAdapter()
    const budget = await db.getBudget(budgetId, userId)

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    const expenses = await db.getExpenses(userId)
    const categories = await db.getCategories(userId)

    const now = new Date()
    let periodStart: Date
    let periodEnd: Date

    if (budget.period === "monthly") {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    } else {
      periodStart = new Date(now.getFullYear(), 0, 1)
      periodEnd = new Date(now.getFullYear(), 11, 31)
    }

    const periodExpenses = expenses.filter((expense: any) => {
      const expenseDate = new Date(expense.date)
      const isInPeriod = expenseDate >= periodStart && expenseDate <= periodEnd
      const isMatchingCategory = expense.category_id === budget.category_id || expense.category === budget.category_id

      return isInPeriod && isMatchingCategory
    })

    const spentAmount = periodExpenses.reduce((sum: number, expense: any) => sum + expense.amount, 0)
    const remainingAmount = budget.amount - spentAmount
    const percentageUsed = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0
    const isOverBudget = spentAmount > budget.amount
    const isNearLimit = percentageUsed >= budget.alert_threshold && !isOverBudget

    const category = categories.find((c: any) => c.id === budget.category_id)

    return NextResponse.json({
      budget,
      category,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      spentAmount,
      remainingAmount,
      percentageUsed,
      isOverBudget,
      isNearLimit,
      periodExpenses,
    })
  } catch (error) {
    console.error("Error debugging budget:", error)
    return NextResponse.json({ error: "Failed to debug budget" }, { status: 500 })
  }
}
