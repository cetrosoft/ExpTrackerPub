"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Expense, Category, Currency } from "@/lib/supabase"
import { Trash2 } from "lucide-react"
import { format } from "date-fns"

interface ExpenseListProps {
  expenses: Expense[]
  categories: Category[]
  currencies: Currency[]
  onDelete: (id: string) => Promise<boolean>
}

export function ExpenseList({ expenses, categories, currencies, onDelete }: ExpenseListProps) {
  const getCategoryName = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.name || "Unknown"
  }

  const getCurrencySymbol = (currencyCode: string) => {
    return currencies.find((curr) => curr.code === currencyCode)?.symbol || currencyCode
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      await onDelete(id)
    }
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-gray-500">No expenses yet. Add your first expense above!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recent Expenses</h2>
      {expenses.map((expense) => (
        <Card key={expense.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">{expense.title}</h3>
                  <Badge variant="secondary">{getCategoryName(expense.category_id)}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{format(new Date(expense.date), "MMM dd, yyyy")}</span>
                  {expense.description && <span className="truncate max-w-xs">{expense.description}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="font-semibold text-lg">
                    {getCurrencySymbol(expense.currency_code)} {expense.amount.toFixed(2)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(expense.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
