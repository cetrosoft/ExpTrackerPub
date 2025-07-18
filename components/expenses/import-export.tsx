"use client"

import type React from "react"

import { useState } from "react"
import { useExpenses } from "@/contexts/expenses-context"
import { useCategories } from "@/contexts/categories-context"
import { useCurrencies } from "@/contexts/currencies-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Download, FileSpreadsheet, Upload, X } from "lucide-react"

// Simple CSV parser function
const parseCSVManually = (text: string): any[] => {
  const lines = text.split("\n").filter((line) => line.trim())
  if (lines.length === 0) return []

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
  const data = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ""
    })
    data.push(row)
  }

  return data
}

// Function to add days to a date
const addDays = (dateString: string, days: number): string => {
  // Parse the date parts
  const parts = dateString.split("-")
  if (parts.length !== 3) return dateString

  const year = Number.parseInt(parts[0], 10)
  const month = Number.parseInt(parts[1], 10) - 1 // JS months are 0-indexed
  const day = Number.parseInt(parts[2], 10)

  // Create a date object and add days
  const date = new Date(year, month, day)
  date.setDate(date.getDate() + days)

  // Format back to YYYY-MM-DD
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  )
}

// Fixed date parsing function that handles Excel serial numbers
const parseDate = (dateValue: any, adjustmentDays = 2): string | null => {
  if (!dateValue) return null

  // Handle Excel serial numbers (like 42856)
  if (typeof dateValue === "number") {
    // Excel serial date (days since 1900-01-01)
    // Excel incorrectly treats 1900 as a leap year, so we need to account for that
    const excelEpoch = new Date(1900, 0, 1)
    const date = new Date(excelEpoch.getTime() + (dateValue - 2) * 24 * 60 * 60 * 1000)

    if (!isNaN(date.getTime())) {
      // Add adjustment days
      date.setDate(date.getDate() + adjustmentDays)

      const result =
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0")

      console.log(`Excel serial ${dateValue} converted to ${result} (with +${adjustmentDays} days adjustment)`)
      return result
    }
  }

  const dateString: string = String(dateValue).replace(/"/g, "").trim()

  if (!dateString) return null

  // Try ISO format first (YYYY-MM-DD)
  const isoMatch = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
    date.setDate(date.getDate() + adjustmentDays)

    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    )
  }

  // Try MM/DD/YYYY format
  const usMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (usMatch) {
    const [, month, day, year] = usMatch
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
    date.setDate(date.getDate() + adjustmentDays)

    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    )
  }

  // Try DD/MM/YYYY format (European)
  const euMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (euMatch) {
    const [, day, month, year] = euMatch
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
    date.setDate(date.getDate() + adjustmentDays)

    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    )
  }

  return null
}

// Import libraries dynamically to avoid SSR issues
let XLSX: any = null

if (typeof window !== "undefined") {
  import("xlsx")
    .then((module) => {
      XLSX = module
    })
    .catch(() => {
      console.log("XLSX library not available, Excel import/export will be disabled")
    })
}

interface ImportExportExpensesProps {
  dictionary: any
}

export function ImportExportExpenses({ dictionary }: ImportExportExpensesProps) {
  const { expenses, addExpense } = useExpenses()
  const { categories } = useCategories()
  const { currencies } = useCurrencies()
  const { user } = useAuth()
  const { toast } = useToast()

  const [importFile, setImportFile] = useState<File | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [ignoreTagField, setIgnoreTagField] = useState(true)
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx">("csv")
  const [dateAdjustment, setDateAdjustment] = useState<number>(2) // Default to adding 2 days

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = [".csv", ".xlsx", ".xls"]
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

      if (!validTypes.includes(fileExtension)) {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV or Excel file (.csv, .xlsx, .xls)",
          variant: "destructive",
        })
        return
      }

      // Check if Excel file but XLSX not available
      if ((fileExtension === ".xlsx" || fileExtension === ".xls") && !XLSX) {
        toast({
          title: "Excel not supported",
          description: "Excel files are not supported. Please use CSV format.",
          variant: "destructive",
        })
        return
      }

      setImportFile(file)
      setImportErrors([])
      setImportProgress(0)
    }
  }

  const parseExcel = async (arrayBuffer: ArrayBuffer): Promise<any[]> => {
    if (!XLSX) {
      throw new Error("Excel parser not available")
    }

    const workbook = XLSX.read(arrayBuffer)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    return XLSX.utils.sheet_to_json(worksheet)
  }

  const handleImport = async () => {
    if (!importFile || !user) return

    setIsImporting(true)
    setImportProgress(0)
    setImportErrors([])

    try {
      let data: any[] = []

      // Parse file based on extension
      if (importFile.name.toLowerCase().endsWith(".csv")) {
        const text = await importFile.text()
        data = parseCSVManually(text)
      } else if (importFile.name.toLowerCase().endsWith(".xlsx") || importFile.name.toLowerCase().endsWith(".xls")) {
        const arrayBuffer = await importFile.arrayBuffer()
        data = await parseExcel(arrayBuffer)
      } else {
        throw new Error("Unsupported file format. Please upload a CSV or Excel file.")
      }

      console.log("Imported data:", data)

      if (!data || data.length === 0) {
        throw new Error("No data found in the file")
      }

      // Validate and process each row
      const errors: string[] = []
      let successCount = 0

      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        setImportProgress(Math.round(((i + 1) / data.length) * 100))

        try {
          // Skip empty rows
          if (!row || Object.keys(row).length === 0) {
            continue
          }

          // Validate required fields (case insensitive)
          const title = row.title || row.Title || row.TITLE
          const amount = row.amount || row.Amount || row.AMOUNT
          const date = row.date || row.Date || row.DATE
          const categoryName = row.category || row.Category || row.CATEGORY
          const description = row.description || row.Description || row.DESCRIPTION || ""
          const currencyCode = row.currency || row.Currency || row.CURRENCY || "EGP"
          const tags = row.tags || row.Tags || row.TAGS || ""

          if (!title) {
            errors.push(`Row ${i + 1}: Missing title`)
            continue
          }

          if (!amount || isNaN(Number(amount))) {
            errors.push(`Row ${i + 1}: Invalid amount (${amount})`)
            continue
          }

          // Enhanced date parsing with adjustment
          let parsedDateString: string | null = null
          try {
            parsedDateString = parseDate(date, dateAdjustment)
            console.log(
              `Row ${i + 1}: Original date: ${date}, Adjusted date (+${dateAdjustment} days): ${parsedDateString}`,
            )
          } catch (error) {
            console.error(`Row ${i + 1}: Date parsing error:`, error)
          }

          if (!parsedDateString) {
            errors.push(`Row ${i + 1}: Invalid date (${date}) - type: ${typeof date}`)
            continue
          }

          console.log(`Row ${i + 1}: Using date string: ${parsedDateString}`)

          // Find category by name
          let categoryId = ""
          if (categoryName) {
            const category = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase())
            if (category) {
              categoryId = category.id
            } else {
              errors.push(`Row ${i + 1}: Category "${categoryName}" not found`)
              continue
            }
          } else {
            // Use default category if not specified
            const defaultCategory = categories.find((c) => c.isDefault) || categories[0]
            if (defaultCategory) {
              categoryId = defaultCategory.id
            } else {
              errors.push(`Row ${i + 1}: No category specified and no default category found`)
              continue
            }
          }

          // Validate currency
          const currency = currencies.find((c) => c.code.toLowerCase() === currencyCode.toLowerCase())
          if (!currency) {
            errors.push(`Row ${i + 1}: Currency "${currencyCode}" not found`)
            continue
          }

          // Process tags if not ignored
          let tagsArray: string[] = []
          if (!ignoreTagField && tags) {
            if (typeof tags === "string") {
              tagsArray = tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
            } else if (Array.isArray(tags)) {
              tagsArray = tags
            }
          }

          // Create expense object with the adjusted date string
          console.log(`Creating expense with date: ${parsedDateString}`)

          await addExpense({
            title: title.toString(),
            amount: Number(amount),
            category_id: categoryId,
            currency_code: currency.code,
            date: parsedDateString,
            description: description.toString(),
            tags: tagsArray,
            supplier_id: undefined,
          })

          successCount++
        } catch (error: any) {
          console.error(`Error processing row ${i + 1}:`, error)
          errors.push(`Row ${i + 1}: ${error.message || "Unknown error"}`)
        }
      }

      setImportErrors(errors)
      setImportProgress(100)

      // Show toast with results
      if (errors.length > 0) {
        toast({
          title: "Import completed with errors",
          description: `Successfully imported ${successCount} expenses. ${errors.length} errors occurred.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Import successful",
          description: `Successfully imported ${successCount} expenses.`,
        })
      }
    } catch (error: any) {
      console.error("Import error:", error)
      toast({
        title: "Import failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleExport = async () => {
    if (expenses.length === 0) {
      toast({
        title: "No expenses to export",
        description: "Add some expenses before exporting.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)

    try {
      // Prepare data for export
      const data = expenses.map((expense) => {
        const category = categories.find((c) => c.id === expense.category_id)
        return {
          title: expense.title,
          amount: expense.amount,
          category: category?.name || "",
          date: expense.date,
          description: expense.description || "",
          currency: expense.currency_code,
          tags: expense.tags?.join(", ") || "",
        }
      })

      const fileName = `expenses-export-${new Date().toISOString().split("T")[0]}`

      if (exportFormat === "csv") {
        // Export as CSV using manual CSV generation
        const headers = ["title", "amount", "category", "date", "description", "currency", "tags"]
        const csvContent = [
          headers.join(","),
          ...data.map((row) =>
            headers
              .map((header) => {
                const value = row[header as keyof typeof row]
                // Escape quotes and wrap in quotes if contains comma or quote
                if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
                  return `"${value.replace(/"/g, '""')}"`
                }
                return value
              })
              .join(","),
          ),
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `${fileName}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        // Export as Excel
        if (!XLSX) {
          toast({
            title: "Excel export not available",
            description: "Please use CSV format for export.",
            variant: "destructive",
          })
          return
        }

        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses")
        XLSX.writeFile(workbook, `${fileName}.xlsx`)
      }

      toast({
        title: "Export successful",
        description: `${expenses.length} expenses exported as ${exportFormat.toUpperCase()}.`,
      })
    } catch (error: any) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const resetImport = () => {
    setImportFile(null)
    setImportErrors([])
    setImportProgress(0)
    setIsImporting(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import & Export Expenses</CardTitle>
        <CardDescription>Import expenses from CSV or Excel files, or export your current expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="importFile">Select CSV or Excel file</Label>
              <Input
                id="importFile"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                disabled={isImporting}
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: CSV (.csv){XLSX ? ", Excel (.xlsx, .xls)" : " (Excel support loading...)"}
              </p>
            </div>

            {importFile && (
              <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded-md">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="flex-1 truncate">{importFile.name}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetImport} disabled={isImporting}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ignoreTagField"
                  checked={ignoreTagField}
                  onCheckedChange={(checked) => setIgnoreTagField(checked as boolean)}
                  disabled={isImporting}
                />
                <Label htmlFor="ignoreTagField">Ignore tag field during import</Label>
              </div>
              <p className="text-xs text-muted-foreground">When enabled, tags from the import file will be ignored</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateAdjustment">Date adjustment (days)</Label>
              <Select
                value={dateAdjustment.toString()}
                onValueChange={(value) => setDateAdjustment(Number.parseInt(value, 10))}
                disabled={isImporting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No adjustment (0 days)</SelectItem>
                  <SelectItem value="1">Add 1 day</SelectItem>
                  <SelectItem value="2">Add 2 days (recommended)</SelectItem>
                  <SelectItem value="3">Add 3 days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current setting: Add {dateAdjustment} day{dateAdjustment !== 1 ? "s" : ""} to each imported date
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm font-medium text-blue-900 mb-2">Expected file format:</p>
              <div className="text-xs text-blue-800 space-y-1">
                <p>
                  <strong>Required columns:</strong> title, amount, date
                </p>
                <p>
                  <strong>Optional columns:</strong> category, description, currency, tags
                </p>
                <p>
                  <strong>Date formats supported:</strong> YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY
                </p>
                <p>
                  <strong>Tags format:</strong> comma-separated values
                </p>
              </div>
            </div>

            {isImporting && (
              <div className="space-y-2">
                <Label>Import progress</Label>
                <Progress value={importProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">{importProgress}%</p>
              </div>
            )}

            {importErrors.length > 0 && (
              <div className="space-y-2 rounded-md border border-red-200 bg-red-50 p-3">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <p className="font-medium">Import errors ({importErrors.length})</p>
                </div>
                <div className="max-h-40 overflow-auto">
                  <ul className="text-sm text-red-600 space-y-1 pl-4 list-disc">
                    {importErrors.slice(0, 10).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {importErrors.length > 10 && <li>...and {importErrors.length - 10} more errors</li>}
                  </ul>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="export" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="exportFormat">Export format</Label>
              <Select value={exportFormat} onValueChange={(value: "csv" | "xlsx") => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="xlsx" disabled={!XLSX}>
                    Excel (.xlsx) {!XLSX && "(Loading...)"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-green-50 rounded-md">
              <p className="text-sm font-medium text-green-900 mb-2">Export summary:</p>
              <div className="text-sm text-green-800 space-y-1">
                <p>
                  <strong>{expenses.length}</strong> expenses will be exported
                </p>
                <p>
                  <strong>Included fields:</strong> title, amount, category, date, description, currency, tags
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetImport}>
          Reset
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleImport} disabled={!importFile || isImporting || isExporting} className="min-w-[120px]">
            {isImporting ? (
              <>Importing...</>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </>
            )}
          </Button>
          <Button
            onClick={handleExport}
            disabled={expenses.length === 0 || isImporting || isExporting}
            className="min-w-[120px]"
          >
            {isExporting ? (
              <>Exporting...</>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
