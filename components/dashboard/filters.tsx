"use client"

<<<<<<< HEAD
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDashboard } from "@/contexts/dashboard-context"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"

interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  exchange_rate: number
  is_default: boolean
  is_active: boolean
  user_id?: string
  created_at: string
  updated_at: string
}

export function DashboardFilters({ dictionary }: { dictionary: any }) {
  const { filters, setCurrency, setMonth, setYear } = useDashboard()
  const { user } = useAuth()
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch currencies from Supabase database
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoading(true)
        const userId = user?.id || ""
        const response = await fetch(`/api/currencies?userId=${userId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch currencies")
        }

        const data = await response.json()
        console.log("Currencies fetched from database:", data)
        setCurrencies(data)
      } catch (error) {
        console.error("Error fetching currencies:", error)
        // Fallback to default currencies if API fails
        setCurrencies([
          {
            id: "usd",
            code: "USD",
            name: "US Dollar",
            symbol: "$",
            exchange_rate: 1.0,
            is_default: false,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "egp",
            code: "EGP",
            name: "Egyptian Pound",
            symbol: "LE",
            exchange_rate: 30.5,
            is_default: true,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchCurrencies()
  }, [user?.id])

  // Filter active currencies
  const activeCurrencies = currencies.filter((currency) => currency.is_active)

  console.log("Active currencies from database:", activeCurrencies)
  console.log("Current filter currency:", filters.currency)

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ]

  const currentYear = new Date().getFullYear()
  const dynamicYears = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)
  const historicalYears = [2017, 2018, 2019]
  const allYears = [...new Set([...historicalYears, ...dynamicYears])].sort((a, b) => a - b)
  const years = allYears

  const goToPreviousMonth = () => {
    if (filters.month === 1) {
      setMonth(12)
      setYear(filters.year - 1)
    } else {
      setMonth(filters.month - 1)
    }
  }

  const goToNextMonth = () => {
    if (filters.month === 12) {
      setMonth(1)
      setYear(filters.year + 1)
    } else {
      setMonth(filters.month + 1)
    }
  }

  const goToCurrentMonth = () => {
    const now = new Date()
    setMonth(now.getMonth() + 1)
    setYear(now.getFullYear())
  }

  const currentMonthName = months.find((m) => m.value === filters.month)?.label

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your expenses and financial data</p>
        </div>
        <Button variant="outline" size="sm" onClick={goToCurrentMonth}>
          <Calendar className="mr-2 h-4 w-4" />
          Current Month
        </Button>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-blue-900">Dashboard Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Currency Filter - Now fetching from Supabase */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Currency</label>
            <Select value={filters.currency} onValueChange={setCurrency} disabled={loading}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder={loading ? "Loading currencies..." : "Select currency"} />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>
                    Loading currencies...
                  </SelectItem>
                ) : activeCurrencies.length > 0 ? (
                  activeCurrencies.map((currency) => (
                    <SelectItem key={currency.id} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{currency.symbol}</span>
                        <span>{currency.code}</span>
                        <span className="text-muted-foreground">- {currency.name}</span>
                        {currency.is_default && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">Default</span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-currencies" disabled>
                    No currencies available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {/* Debug info */}
            <div className="text-xs text-gray-500">
              {loading ? "Loading..." : `Found ${activeCurrencies.length} currencies from database`}
            </div>
          </div>

          {/* Month Filter with Navigation */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Month</label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousMonth} className="h-10 w-10 bg-white">
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Select value={filters.month.toString()} onValueChange={(value) => setMonth(Number.parseInt(value))}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
=======
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Filter } from "lucide-react"
import { useDashboard } from "@/contexts/dashboard-context"
import { useCurrencies } from "@/contexts/currencies-context"

export function DashboardFilters({ dictionary }: { dictionary: any }) {
  const { filters, updateFilters } = useDashboard()
  const { currencies } = useCurrencies()

  const handleCurrentMonth = () => {
    const now = new Date()
    updateFilters({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Dashboard Filters</h3>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="outline" onClick={handleCurrentMonth} className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Current Month</span>
            </Button>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Currency:</label>
              <Select value={filters.currency} onValueChange={(value) => updateFilters({ currency: value })}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center space-x-2">
                        <span>{currency.symbol}</span>
                        <span>{currency.name}</span>
                      </div>
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
<<<<<<< HEAD

              <Button variant="outline" size="icon" onClick={goToNextMonth} className="h-10 w-10 bg-white">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Year Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Year</label>
            <Select value={filters.year.toString()} onValueChange={(value) => setYear(Number.parseInt(value))}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Current Selection Display */}
        <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <div className="text-blue-700">
              <strong>Viewing:</strong> {currentMonthName} {filters.year}
            </div>
            <div className="text-blue-700">
              <strong>Currency:</strong> {filters.currency}
            </div>
          </div>
        </div>
      </div>
    </div>
=======
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
  )
}
