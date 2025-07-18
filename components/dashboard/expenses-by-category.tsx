"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useExpenses } from "@/contexts/expenses-context"
import { useCategories } from "@/contexts/categories-context"
import { useCurrencies } from "@/contexts/currencies-context"
import { useDashboard } from "@/contexts/dashboard-context"
import { filterExpensesByPeriod, convertCurrency } from "@/lib/expense-utils"
import { formatCurrency } from "@/lib/utils"
import { useEffect, useState } from "react"

export function ExpensesByCategory({ dictionary, lang }: { dictionary: any; lang: string }) {
  const { expenses, loading } = useExpenses()
  const { categories } = useCategories()
  const { currencies } = useCurrencies()
  const { filters } = useDashboard()
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    if (loading) return

    console.log("Updating category chart for:", filters)

    const filteredExpenses = filterExpensesByPeriod(expenses, filters.month, filters.year)

    const expensesByCategory = filteredExpenses.reduce(
      (acc, expense) => {
        const convertedAmount = convertCurrency(
          expense.amount,
          expense.currency_code || expense.currency || "EGP",
          filters.currency,
          currencies,
        )
        acc[expense.category_id] = (acc[expense.category_id] || 0) + convertedAmount
        return acc
      },
      {} as Record<string, number>,
    )

    const total = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0)

    const data = Object.entries(expensesByCategory).map(([categoryId, amount], index) => {
      const category = categories.find((cat) => cat.id === categoryId)
      const categoryName = category?.name || categoryId

      return {
        name: categoryName,
        value: total > 0 ? Math.round((amount / total) * 100) : 0,
        amount: amount,
        color: category?.color || getDefaultColor(index),
      }
    })

    setChartData(data)
    console.log("Category chart updated:", data)
  }, [expenses, filters, categories, currencies, loading])

  function getDefaultColor(index: number) {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"]
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">No expenses found for this period</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Expenses by Category -{" "}
        {new Date(filters.year, filters.month - 1).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}
      </h3>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [
                `${value}% (${formatCurrency(props.payload.amount, filters.currency)})`,
                name,
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
