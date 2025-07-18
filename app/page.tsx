<<<<<<< HEAD
import { getDictionary } from "@/lib/dictionaries"
import { DashboardProvider } from "@/contexts/dashboard-context"
import { DashboardFilters } from "@/components/dashboard/filters"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ExpensesByCategory } from "@/components/dashboard/expenses-by-category"
import { ExpensesByTags } from "@/components/dashboard/expenses-by-tags"
import { RecentExpenses } from "@/components/dashboard/recent-expenses"
import { MonthlyTrendChart } from "@/components/dashboard/monthly-trend-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DashboardPage({
  params: { lang },
}: {
  params: { lang: string }
}) {
  const dictionary = await getDictionary(lang)

  return (
    <DashboardProvider>
      <div className="space-y-6">
        {/* Enhanced Filters Component - This was missing! */}
        <DashboardFilters dictionary={dictionary} />

        {/* Stats Cards */}
        <StatsCards dictionary={dictionary} lang={lang} />

        {/* Charts Tabs */}
        <Tabs defaultValue="by-category" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="by-category">By Category</TabsTrigger>
            <TabsTrigger value="by-tags">By Tags</TabsTrigger>
            <TabsTrigger value="monthly-trend">Monthly Trend</TabsTrigger>
          </TabsList>
          <TabsContent value="by-category" className="bg-white rounded-lg border p-6">
            <ExpensesByCategory dictionary={dictionary} lang={lang} />
          </TabsContent>
          <TabsContent value="by-tags" className="bg-white rounded-lg border p-6">
            <ExpensesByTags dictionary={dictionary} lang={lang} />
          </TabsContent>
          <TabsContent value="monthly-trend">
            <MonthlyTrendChart dictionary={dictionary} lang={lang} />
          </TabsContent>
        </Tabs>

        {/* Recent Expenses */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Expenses</h2>
          <RecentExpenses dictionary={dictionary} lang={lang} />
        </div>
      </div>
    </DashboardProvider>
=======
"use client"

import { useAuth } from "@/contexts/auth-context"
import { Auth } from "@/components/auth"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseList } from "@/components/expense-list"
import { useExpenses } from "@/hooks/use-expenses"
import { Loader2 } from "lucide-react"

export default function Home() {
  const { user, loading } = useAuth()
  const { expenses, categories, currencies, loading: dataLoading, addExpense, deleteExpense } = useExpenses(user)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login page if not authenticated
  if (!user) {
    return <Auth />
  }

  // Show main app if authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Expense Tracker</h1>
            <p className="text-gray-600">Track and manage your expenses with ease</p>
          </div>
          <div className="text-sm text-gray-500">Welcome, {user.email}</div>
        </div>

        {dataLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <ExpenseForm categories={categories} currencies={currencies} onSubmit={addExpense} />
            <ExpenseList expenses={expenses} categories={categories} currencies={currencies} onDelete={deleteExpense} />
          </div>
        )}
      </div>
    </div>
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
  )
}
