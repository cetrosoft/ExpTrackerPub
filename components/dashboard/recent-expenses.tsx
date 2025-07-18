"use client"

import { useExpenses } from "@/contexts/expenses-context"
import { useCategories } from "@/contexts/categories-context"
import { useCurrencies } from "@/contexts/currencies-context"
import { useDashboard } from "@/contexts/dashboard-context"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { filterExpensesByPeriod, convertCurrency } from "@/lib/expense-utils"
import { ClientOnly } from "@/components/client-only"

export function RecentExpenses({ dictionary, lang }: { dictionary: any; lang: string }) {
  const { expenses } = useExpenses()
  const { categories } = useCategories()
  const { currencies } = useCurrencies()
  const { filters } = useDashboard()
  const isRtl = lang === "ar"

  // Filter expenses based on current filters and get the 5 most recent
  const filteredExpenses = filterExpensesByPeriod(expenses, filters.month, filters.year, filters.currency)
  const recentExpenses = filteredExpenses
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    if (category) {
      return category.isDefault ? dictionary.categories[category.id] || category.name : category.name
    }
    return categoryId
  }

  const getCategoryColor = (categoryId: string) => {
    const colors: Record<string, string> = {
      transportation: "bg-blue-100 text-blue-800",
      healthcare: "bg-green-100 text-green-800",
      food: "bg-yellow-100 text-yellow-800",
      entertainment: "bg-purple-100 text-purple-800",
      utilities: "bg-gray-100 text-gray-800",
      shopping: "bg-pink-100 text-pink-800",
      education: "bg-indigo-100 text-indigo-800",
      travel: "bg-cyan-100 text-cyan-800",
      other: "bg-orange-100 text-orange-800",
    }
    return colors[categoryId] || "bg-gray-100 text-gray-800"
  }

  if (recentExpenses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{dictionary.expenses.no_expenses}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {recentExpenses.map((expense) => {
            const convertedAmount = convertCurrency(expense.amount, expense.currency, filters.currency, currencies)

            return (
              <div key={expense.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className={`flex flex-col ${isRtl ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{expense.title}</p>
                    <Badge variant="secondary" className={getCategoryColor(expense.category)}>
                      {getCategoryName(expense.category)}
                    </Badge>
                  </div>
                  <ClientOnly fallback={<p className="text-sm text-muted-foreground">Loading date...</p>}>
                    <p className="text-sm text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                  </ClientOnly>
                </div>
                <ClientOnly fallback={<div className="font-semibold">Loading...</div>}>
                  <div className="font-semibold">{formatCurrency(convertedAmount, filters.currency)}</div>
                </ClientOnly>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
