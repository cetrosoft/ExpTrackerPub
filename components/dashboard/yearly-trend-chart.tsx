"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { useExpenses } from "@/contexts/expenses-context"
import { useCurrencies } from "@/contexts/currencies-context"
import { useDashboard } from "@/contexts/dashboard-context"
import { convertCurrency } from "@/lib/expense-utils"
import { formatCurrency } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function YearlyTrendChart({ dictionary, lang }: { dictionary: any; lang: string }) {
  const { expenses, loading } = useExpenses()
  const { currencies } = useCurrencies()
  const { filters } = useDashboard()
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    if (loading) return

    // Get all unique years from expenses
    const years = [...new Set(expenses.map((expense) => new Date(expense.date).getFullYear()))].sort((a, b) => a - b)

    const yearlyData = years.map((year) => {
      const yearExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getFullYear() === year
      })

      const total = yearExpenses.reduce((sum, expense) => {
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

      return {
        year: year.toString(),
        amount: Math.round(total * 100) / 100,
        count: yearExpenses.length,
      }
    })

    setChartData(yearlyData)
  }, [expenses, filters, currencies, loading])

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">No expense data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Yearly Expense Trends</h3>

      <Tabs defaultValue="line" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="line">Line Chart</TabsTrigger>
          <TabsTrigger value="bar">Bar Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="line" className="mt-4">
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value, filters.currency, true)}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(Number(value), filters.currency),
                    name === "amount" ? "Total Amount" : "Transaction Count",
                  ]}
                  labelFormatter={(label) => `Year: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="bar" className="mt-4">
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value, filters.currency, true)}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(Number(value), filters.currency),
                    name === "amount" ? "Total Amount" : "Transaction Count",
                  ]}
                  labelFormatter={(label) => `Year: ${label}`}
                />
                <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Years</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chartData.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Highest Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chartData.length > 0
                ? formatCurrency(Math.max(...chartData.map((d) => d.amount)), filters.currency, true)
                : formatCurrency(0, filters.currency, true)}
            </div>
            <p className="text-xs text-muted-foreground">
              {chartData.length > 0
                ? chartData.find((d) => d.amount === Math.max(...chartData.map((d) => d.amount)))?.year
                : "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average per Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chartData.length > 0
                ? formatCurrency(
                    chartData.reduce((sum, d) => sum + d.amount, 0) / chartData.length,
                    filters.currency,
                    true,
                  )
                : formatCurrency(0, filters.currency, true)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
