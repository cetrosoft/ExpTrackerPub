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
  )
}
