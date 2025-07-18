"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useExpenses } from "@/contexts/expenses-context"
import { useTags } from "@/contexts/tags-context"
import { useCurrencies } from "@/contexts/currencies-context"
import { useDashboard } from "@/contexts/dashboard-context"
import { filterExpensesByPeriod, convertCurrency, getMonthName } from "@/lib/expense-utils"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"

export function ExpensesByTags({ dictionary, lang }: { dictionary: any; lang: string }) {
  const { expenses, loading } = useExpenses()
  const { tags } = useTags()
  const { currencies } = useCurrencies()
  const { filters } = useDashboard()
  const isRtl = lang === "ar"
  const [chartData, setChartData] = useState<any[]>([])
  const [totalAmount, setTotalAmount] = useState(0)

  // Update chart data when filters or expenses change
  useEffect(() => {
    if (loading) return

    // Filter expenses based on current filters
    const filteredExpenses = filterExpensesByPeriod(expenses, filters.month, filters.year)

    // Convert amounts to selected currency and group by tags
    const expensesByTags = filteredExpenses.reduce(
      (acc, expense) => {
        const convertedAmount = convertCurrency(
          expense.amount,
          expense.currency_code || expense.currency,
          filters.currency,
          currencies,
        )
        expense.tags?.forEach((tagId) => {
          acc[tagId] = (acc[tagId] || 0) + convertedAmount
        })
        return acc
      },
      {} as Record<string, number>,
    )

    const total = Object.values(expensesByTags).reduce((sum, amount) => sum + amount, 0)
    setTotalAmount(total)

    const data = Object.entries(expensesByTags).map(([tagId, amount], index) => {
      const tag = tags.find((t) => t.id === tagId)
      const tagName = tag ? tag.name : tagId

      return {
        name: tagName,
        value: total > 0 ? Math.round((amount / total) * 100) : 0,
        amount: amount,
        color: tag?.color || getDefaultTagColor(index),
      }
    })

    setChartData(data)
  }, [expenses, filters, tags, currencies, loading])

  function getDefaultTagColor(index: number) {
    const colors = ["#4285F4", "#34A853", "#22CCDD", "#FF6B6B", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981", "#6366F1"]
    return colors[index % colors.length]
  }

  const monthName = getMonthName(filters.month, dictionary)

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Expenses by Tags - {monthName} {filters.year}
        </h3>
        <div className="h-[300px] flex items-center justify-center">
          <Skeleton className="h-[250px] w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (chartData.length === 0 || totalAmount === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Expenses by Tags - {monthName} {filters.year}
        </h3>
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No tagged expenses found for this period</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Expenses by Tags - {monthName} {filters.year}
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
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              animationDuration={500}
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
              contentStyle={{
                textAlign: isRtl ? "right" : "left",
                direction: isRtl ? "rtl" : "ltr",
              }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              formatter={(value) => <span style={{ direction: isRtl ? "rtl" : "ltr" }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
