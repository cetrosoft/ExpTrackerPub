"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useSettings } from "@/contexts/settings-context"
import { useExpenses } from "@/contexts/expenses-context"
import { useCategories } from "@/contexts/categories-context"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Download, Upload, Trash2, Globe, Palette, Bell, Database, Info, SettingsIcon } from "lucide-react"

export function SettingsPage({ dictionary, lang }: { dictionary: any; lang: string }) {
  const { settings, updateSettings, resetSettings, exportSettings, importSettings } = useSettings()
  const { expenses } = useExpenses()
  const { categories } = useCategories()
  const [importFile, setImportFile] = useState<File | null>(null)
  const isRtl = lang === "ar"

  const [currencies, setCurrencies] = useState<Array<{ value: string; label: string; isDefault?: boolean }>>([])
  const [currenciesLoading, setCurrenciesLoading] = useState(true)
  const { user } = useAuth()

  // Fetch currencies from database
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setCurrenciesLoading(true)
        console.log("🔍 Fetching currencies from database for settings...")
        console.log("🔍 User ID:", user?.id)

        const url = `/api/currencies${user?.id ? `?userId=${user.id}` : ""}`
        console.log("🔍 API URL:", url)

        const response = await fetch(url)
        console.log("🔍 Response status:", response.status)
        console.log("🔍 Response ok:", response.ok)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("❌ API Error:", errorText)
          throw new Error(`Failed to fetch currencies: ${response.status}`)
        }

        const data = await response.json()
        console.log("✅ Raw currencies data from database:", data)
        console.log("✅ Data type:", typeof data)
        console.log("✅ Is array:", Array.isArray(data))
        console.log("✅ Data length:", data?.length)

        if (!Array.isArray(data)) {
          console.error("❌ Data is not an array:", data)
          throw new Error("Invalid data format received")
        }

        // Filter active currencies and format for select
        const activeCurrencies = data
          .filter((currency: any) => {
            console.log("🔍 Checking currency:", currency.code, "is_active:", currency.is_active)
            return currency.is_active
          })
          .map((currency: any) => ({
            value: currency.code,
            label: `${currency.symbol} ${currency.code} - ${currency.name}`,
            isDefault: currency.is_default,
          }))

        console.log("✅ Active currencies for settings:", activeCurrencies)
        console.log("✅ Active currencies count:", activeCurrencies.length)
        setCurrencies(activeCurrencies)
      } catch (error) {
        console.error("❌ Failed to fetch currencies for settings:", error)
        console.log("🔄 Using fallback currencies...")
        // Fallback to default currencies
        const fallbackCurrencies = [
          { value: "USD", label: "$ USD - US Dollar", isDefault: true },
          { value: "EGP", label: "LE EGP - Egyptian Pound" },
          { value: "EUR", label: "€ EUR - Euro" },
          { value: "GBP", label: "£ GBP - British Pound" },
          { value: "INR", label: "₹ INR - Indian Rupee" },
        ]
        console.log("🔄 Fallback currencies:", fallbackCurrencies)
        setCurrencies(fallbackCurrencies)
      } finally {
        setCurrenciesLoading(false)
        console.log("✅ Currency loading finished")
      }
    }

    fetchCurrencies()
  }, [user?.id])

  const handleExportData = () => {
    const data = {
      expenses,
      categories: categories.filter((cat) => !cat.isDefault),
      settings,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `expense-tracker-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportCSV = () => {
    const csvHeaders = ["Date", "Title", "Amount", "Category", "Description"]
    const csvRows = expenses.map((expense) => [
      expense.date,
      expense.title,
      expense.amount.toString(),
      expense.category,
      expense.description || "",
    ])

    const csvContent = [csvHeaders, ...csvRows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `expenses-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportFile = async () => {
    if (!importFile) return

    try {
      const text = await importFile.text()
      const data = JSON.parse(text)

      if (data.settings) {
        importSettings(JSON.stringify(data.settings))
      }
    } catch (error) {
      console.error("Import failed:", error)
    }
  }

  const languages = [
    { value: "en", label: "English" },
    { value: "ar", label: "العربية" },
    { value: "hi", label: "हिन्दी" },
  ]

  const themes = [
    { value: "light", label: dictionary.settings.light_theme },
    { value: "dark", label: dictionary.settings.dark_theme },
    { value: "system", label: dictionary.settings.system_theme },
  ]

  const dateFormats = [
    { value: "dd_mm_yyyy", label: dictionary.settings.date_format_options.dd_mm_yyyy },
    { value: "mm_dd_yyyy", label: dictionary.settings.date_format_options.mm_dd_yyyy },
    { value: "yyyy_mm_dd", label: dictionary.settings.date_format_options.yyyy_mm_dd },
  ]

  return (
    <div className="space-y-6">
      <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}>
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{dictionary.settings.title}</h1>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {dictionary.settings.general}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            {dictionary.settings.preferences}
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            {dictionary.settings.data_management}
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            {dictionary.settings.about}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.settings.general}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language">{dictionary.settings.language}</Label>
                  <Select
                    value={settings.language || "en"}
                    onValueChange={(value) => updateSettings({ language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings?.currency || "USD"}
                    onValueChange={(value) => {
                      updateSettings({ currency: value })
                    }}
                    disabled={currenciesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={currenciesLoading ? "Loading currencies..." : "Select currency"} />
                    </SelectTrigger>
                    <SelectContent>
                      {currenciesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading currencies...
                        </SelectItem>
                      ) : (
                        currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            <div className="flex items-center justify-between w-full">
                              <span>{currency.label}</span>
                              {currency.isDefault && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  Default
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">{dictionary.settings.date_format}</Label>
                  <Select
                    value={settings.dateFormat || "dd_mm_yyyy"}
                    onValueChange={(value) => updateSettings({ dateFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dateFormats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">{dictionary.settings.theme}</Label>
                  <Select value={settings.theme || "light"} onValueChange={(value) => updateSettings({ theme: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map((theme) => (
                        <SelectItem key={theme.value} value={theme.value}>
                          {theme.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {dictionary.settings.notifications}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">{dictionary.settings.enable_notifications}</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for important events</p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings?.notifications?.enabled || false}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      notifications: {
                        ...settings?.notifications,
                        enabled: checked,
                        expenseReminders: settings?.notifications?.expenseReminders || false,
                        budgetAlerts: settings?.notifications?.budgetAlerts || false,
                        weeklyReports: settings?.notifications?.weeklyReports || false,
                      },
                    })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="expenseReminders">{dictionary.settings.expense_reminders}</Label>
                  <Switch
                    id="expenseReminders"
                    checked={settings?.notifications?.expenseReminders || false}
                    disabled={!settings?.notifications?.enabled}
                    onCheckedChange={(checked) =>
                      updateSettings({
                        notifications: {
                          ...settings?.notifications,
                          expenseReminders: checked,
                          enabled: settings?.notifications?.enabled || false,
                          budgetAlerts: settings?.notifications?.budgetAlerts || false,
                          weeklyReports: settings?.notifications?.weeklyReports || false,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="budgetAlerts">{dictionary.settings.budget_alerts}</Label>
                  <Switch
                    id="budgetAlerts"
                    checked={settings?.notifications?.budgetAlerts || false}
                    disabled={!settings?.notifications?.enabled}
                    onCheckedChange={(checked) =>
                      updateSettings({
                        notifications: {
                          ...settings?.notifications,
                          budgetAlerts: checked,
                          enabled: settings?.notifications?.enabled || false,
                          expenseReminders: settings?.notifications?.expenseReminders || false,
                          weeklyReports: settings?.notifications?.weeklyReports || false,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="weeklyReports">{dictionary.settings.weekly_reports}</Label>
                  <Switch
                    id="weeklyReports"
                    checked={settings?.notifications?.weeklyReports || false}
                    disabled={!settings?.notifications?.enabled}
                    onCheckedChange={(checked) =>
                      updateSettings({
                        notifications: {
                          ...settings?.notifications,
                          weeklyReports: checked,
                          enabled: settings?.notifications?.enabled || false,
                          expenseReminders: settings?.notifications?.expenseReminders || false,
                          budgetAlerts: settings?.notifications?.budgetAlerts || false,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {dictionary.settings.currency} {dictionary.settings.preferences}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currencySymbol">{dictionary.settings.currency_symbol}</Label>
                  <Input
                    id="currencySymbol"
                    value={settings?.currencyDisplay?.symbol || "$"}
                    onChange={(e) =>
                      updateSettings({
                        currencyDisplay: {
                          ...settings?.currencyDisplay,
                          symbol: e.target.value,
                          decimalPlaces: settings?.currencyDisplay?.decimalPlaces ?? 2,
                          thousandSeparator: settings?.currencyDisplay?.thousandSeparator || ",",
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="decimalPlaces">{dictionary.settings.decimal_places}</Label>
                  <Select
                    value={(settings?.currencyDisplay?.decimalPlaces ?? 2).toString()}
                    onValueChange={(value) =>
                      updateSettings({
                        currencyDisplay: {
                          ...settings?.currencyDisplay,
                          decimalPlaces: Number.parseInt(value),
                          symbol: settings?.currencyDisplay?.symbol || "$",
                          thousandSeparator: settings?.currencyDisplay?.thousandSeparator || ",",
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thousandSeparator">{dictionary.settings.thousand_separator}</Label>
                  <Select
                    value={settings?.currencyDisplay?.thousandSeparator || "none"}
                    onValueChange={(value) =>
                      updateSettings({
                        currencyDisplay: {
                          ...settings?.currencyDisplay,
                          thousandSeparator: value === "none" ? "" : value,
                          symbol: settings?.currencyDisplay?.symbol || "$",
                          decimalPlaces: settings?.currencyDisplay?.decimalPlaces ?? 2,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=",">,</SelectItem>
                      <SelectItem value=".">.</SelectItem>
                      <SelectItem value=" ">Space</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.settings.export_data}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={handleExportData} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  {dictionary.settings.export_json}
                </Button>
                <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  {dictionary.settings.export_csv}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{dictionary.settings.import_data}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="importFile">Select backup file</Label>
                <Input
                  id="importFile"
                  type="file"
                  accept=".json"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                />
              </div>
              <Button onClick={handleImportFile} disabled={!importFile} className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {dictionary.settings.import_data}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">{dictionary.settings.clear_data}</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    {dictionary.settings.clear_all_data}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{dictionary.settings.clear_all_data}</AlertDialogTitle>
                    <AlertDialogDescription>{dictionary.settings.confirm_clear_data}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{dictionary.form.cancel}</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                      {dictionary.settings.clear_all_data}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.settings.about}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>{dictionary.settings.app_version}</Label>
                  <p className="text-sm text-muted-foreground">v1.0.0</p>
                </div>
                <div>
                  <Label>{dictionary.settings.build_date}</Label>
                  <p className="text-sm text-muted-foreground">January 2025</p>
                </div>
                <div>
                  <Label>{dictionary.settings.developer}</Label>
                  <p className="text-sm text-muted-foreground">ExpenseTracker Team</p>
                </div>
                <div>
                  <Label>Data Statistics</Label>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{expenses.length} expenses</Badge>
                    <Badge variant="outline">{categories.length} categories</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
