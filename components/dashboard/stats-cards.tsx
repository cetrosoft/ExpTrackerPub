"use client"

import { DollarSign, CreditCard, TrendingUp, Calculator, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useExpenses } from "@/contexts/expenses-context"
import { useCurrencies } from "@/contexts/currencies-context"
import { useDashboard } from "@/contexts/dashboard-context"
import { formatCurrency } from "@/lib/utils"
import { convertCurrency } from "@/lib/expense-utils"
import { useEffect, useState } from "react"

interface StatsCardsProps {
  dictionary: any
  lang?: string
}

export function StatsCards({ dictionary, lang = "en" }: StatsCardsProps) {
  const { expenses, loading } = useExpenses()
  const { currencies } = useCurrencies()
  const { filters } = useDashboard()
  const [stats, setStats] = useState({
    totalYearExpenses: 0,
    currentMonthTotal: 0,
    transactionCount: 0,
    categoriesCount: 0,
  })

  useEffect(() => {
    if (loading || !expenses || expenses.length === 0) {
      console.log("⏳ Stats calculation skipped - loading or no expenses")
      return
    }

    console.log("🔍 DEBUGGING STATS CALCULATION:")
    console.log("📊 Total expenses in database:", expenses.length)
    console.log("📅 Filter year:", filters.year)
    console.log("📅 Filter month:", filters.month)
    console.log("💰 Filter currency:", filters.currency)
    console.log("📋 All expenses:", expenses)

    // Filter expenses by year (for total year expenses)
    const yearExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      const expenseYear = expenseDate.getFullYear()
      const matches = expenseYear === filters.year

      if (!matches) {
        console.log(`❌ Expense excluded (year ${expenseYear} != ${filters.year}):`, expense.title, expense.amount)
      } else {
        console.log(
          `✅ Expense included (year ${expenseYear}):`,
          expense.title,
          expense.amount,
          expense.currency || expense.currency_code,
        )
      }

      return matches
    })

    // Filter expenses by current month
    const currentMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      const expenseYear = expenseDate.getFullYear()
      const expenseMonth = expenseDate.getMonth() + 1
      return expenseYear === filters.year && expenseMonth === filters.month
    })

    console.log("📊 Year expenses found:", yearExpenses.length)
    console.log("📊 Current month expenses found:", currentMonthExpenses.length)

    // Calculate totals with currency conversion
    let totalYearExpenses = 0
    let currentMonthTotal = 0

    // Calculate year total
    yearExpenses.forEach((expense) => {
      const expenseCurrency = expense.currency || expense.currency_code || "EGP"
      const convertedAmount = convertCurrency(expense.amount, expenseCurrency, filters.currency, currencies)
      totalYearExpenses += convertedAmount

      console.log(
        `💰 Year expense: ${expense.title} - ${expense.amount} ${expenseCurrency} = ${convertedAmount} ${filters.currency}`,
      )
    })

    // Calculate current month total
    currentMonthExpenses.forEach((expense) => {
      const expenseCurrency = expense.currency || expense.currency_code || "EGP"
      const convertedAmount = convertCurrency(expense.amount, expenseCurrency, filters.currency, currencies)
      currentMonthTotal += convertedAmount

      console.log(
        `💰 Month expense: ${expense.title} - ${expense.amount} ${expenseCurrency} = ${convertedAmount} ${filters.currency}`,
      )
    })

    // Calculate categories count
    const categoriesCount = new Set(currentMonthExpenses.map((e) => e.category || e.category_id)).size

    const finalStats = {
      totalYearExpenses: Math.round(totalYearExpenses * 100) / 100,
      currentMonthTotal: Math.round(currentMonthTotal * 100) / 100,
      transactionCount: currentMonthExpenses.length,
      categoriesCount,
    }

    console.log("🎯 FINAL CALCULATED STATS:")
    console.log("💰 Total Year Expenses:", finalStats.totalYearExpenses, filters.currency)
    console.log("💰 Current Month Total:", finalStats.currentMonthTotal, filters.currency)
    console.log("📊 Transaction Count:", finalStats.transactionCount)
    console.log("📂 Categories Count:", finalStats.categoriesCount)

    setStats(finalStats)
  }, [expenses, filters, currencies, loading])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <h3 className="text-2xl font-bold mt-1">{formatCurrency(stats.totalYearExpenses, filters.currency)}</h3>
              <p className="text-xs text-muted-foreground">Year {filters.year}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Monthly</p>
              <h3 className="text-2xl font-bold mt-1">{formatCurrency(stats.currentMonthTotal, filters.currency)}</h3>
              <p className="text-xs text-muted-foreground">
                {new Date(filters.year, filters.month - 1).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Transactions</p>
              <h3 className="text-2xl font-bold mt-1">{stats.transactionCount}</h3>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Categories</p>
              <h3 className="text-2xl font-bold mt-1">{stats.categoriesCount}</h3>
              <p className="text-xs text-muted-foreground">Active this month</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. per Transaction</p>
              <h3 className="text-2xl font-bold mt-1">
                {formatCurrency(
                  stats.transactionCount > 0 ? stats.currentMonthTotal / stats.transactionCount : 0,
                  filters.currency,
                )}
              </h3>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Calculator className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
