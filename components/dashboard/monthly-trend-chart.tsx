"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useExpenses } from "@/contexts/expenses-context"
import { useCurrencies } from "@/contexts/currencies-context"
import { useDashboard } from "@/contexts/dashboard-context"
import { convertCurrency } from "@/lib/expense-utils"
import { formatCurrency } from "@/lib/utils"
import { useEffect, useState } from "react"

export function MonthlyTrendChart({ dictionary, lang }: { dictionary: any; lang: string }) {
  const { expenses, loading } = useExpenses()
  const { currencies } = useCurrencies()
  const { filters } = useDashboard()
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    if (loading) return

    const monthlyData = []
    for (let month = 1; month <= 12; month++) {
      const monthExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getMonth() + 1 === month && expenseDate.getFullYear() === filters.year
      })

      const total = monthExpenses.reduce((sum, expense) => {
        return (
          sum +
          convertCurrency(
            expense.amount,
            expense.currency_code || expense.currency || "EGP",
            filters.currency,
            currencies,
          )
        )
      }, 0)

      monthlyData.push({
        month: new Date(filters.year, month - 1).toLocaleDateString("en-US", { month: "short" }),
        amount: total,
      })
    }

    setChartData(monthlyData)
  }, [expenses, filters, currencies, loading])

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Monthly Trend - {filters.year}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [formatCurrency(Number(value), filters.currency), "Amount"]} />
            <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
