import { getDictionary } from "@/lib/dictionaries"
import { DashboardProvider } from "@/contexts/dashboard-context"
import { DashboardFilters } from "@/components/dashboard/filters"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ExpensesByCategory } from "@/components/dashboard/expenses-by-category"
import { ExpensesByTags } from "@/components/dashboard/expenses-by-tags"
import { MonthlyTrendChart } from "@/components/dashboard/monthly-trend-chart"
import { YearlyTrendChart } from "@/components/dashboard/yearly-trend-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage({
  params: { lang },
}: {
  params: { lang: string }
}) {
  const dictionary = await getDictionary(lang)

  return (
    <DashboardProvider>
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="flex flex-col space-y-2">
<<<<<<< HEAD
          {/* <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1> */}
          {/* <p className="text-gray-600">Overview of your expenses and financial data</p> */}
=======
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your expenses and financial data</p>
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
        </div>

        {/* Filters */}
        <DashboardFilters dictionary={dictionary} />

        {/* Stats Cards */}
        <StatsCards dictionary={dictionary} lang={lang} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6">
          {/* Charts Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="by-category" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="by-category">Category</TabsTrigger>
                  <TabsTrigger value="by-tags">Tags</TabsTrigger>
                  <TabsTrigger value="monthly-trend">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly-trend">Yearly</TabsTrigger>
                </TabsList>
                <TabsContent value="by-category" className="mt-4">
                  <ExpensesByCategory dictionary={dictionary} lang={lang} />
                </TabsContent>
                <TabsContent value="by-tags" className="mt-4">
                  <ExpensesByTags dictionary={dictionary} lang={lang} />
                </TabsContent>
                <TabsContent value="monthly-trend" className="mt-4">
                  <MonthlyTrendChart dictionary={dictionary} lang={lang} />
                </TabsContent>
                <TabsContent value="yearly-trend" className="mt-4">
                  <YearlyTrendChart dictionary={dictionary} lang={lang} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardProvider>
  )
}
