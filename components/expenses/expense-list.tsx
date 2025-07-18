"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useExpenses } from "@/contexts/expenses-context"
import { useCategories } from "@/contexts/categories-context"
import { useTags } from "@/contexts/tags-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { ExpenseForm } from "./expense-form"
import {
  MoreHorizontal,
  Search,
  Filter,
  Grid,
  List,
  LayoutGrid,
  Plus,
  Trash,
  Edit,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Simple date range picker without external dependencies
function SimpleDateRangePicker({
  value,
  onChange,
}: {
  value: { from?: Date; to?: Date }
  onChange: (range: { from?: Date; to?: Date }) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        value={value.from ? format(value.from, "yyyy-MM-dd") : ""}
        onChange={(e) =>
          onChange({
            ...value,
            from: e.target.value ? new Date(e.target.value) : undefined,
          })
        }
        className="w-36"
      />
      <span className="text-sm text-muted-foreground">to</span>
      <Input
        type="date"
        value={value.to ? format(value.to, "yyyy-MM-dd") : ""}
        onChange={(e) =>
          onChange({
            ...value,
            to: e.target.value ? new Date(e.target.value) : undefined,
          })
        }
        className="w-36"
      />
    </div>
  )
}

// Custom ViewToggle component
function ViewToggle({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex items-center border rounded-md overflow-hidden">
      <button
        className={`p-2 ${value === "cards" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
        onClick={() => onChange("cards")}
        aria-label="Cards view"
      >
        <LayoutGrid size={18} />
      </button>
      <button
        className={`p-2 ${value === "list" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
        onClick={() => onChange("list")}
        aria-label="List view"
      >
        <List size={18} />
      </button>
      <button
        className={`p-2 ${value === "grid" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
        onClick={() => onChange("grid")}
        aria-label="Grid view"
      >
        <Grid size={18} />
      </button>
    </div>
  )
}

export function ExpenseList() {
  const { expenses, loading, deleteExpense } = useExpenses()
  const { categories } = useCategories()
  const { tags } = useTags()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [tagFilter, setTagFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"cards" | "list" | "grid">("list") // Changed default to list
  const [editingExpense, setEditingExpense] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<string | null>(null)
  const [deletingExpense, setDeletingExpense] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10) // Changed default to 10
  const [sortField, setSortField] = useState<"date" | "title" | "amount" | "category">("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Date range filter - default to current month
  const today = new Date()
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: startOfMonth(today),
    to: endOfMonth(today),
  })

  // Debug log to see how many expenses we actually have
  useEffect(() => {
    console.log(`🔍 [ExpenseList] Total expenses loaded: ${expenses.length}`)

    // Debug the first expense to see its structure
    if (expenses.length > 0) {
      console.log("📊 Sample expense structure:", expenses[0])
    }
  }, [expenses.length])

  // Debug when tag filter changes
  useEffect(() => {
    if (tagFilter !== "all") {
      console.log(`🏷️ Tag filter changed to: ${tagFilter}`)

      // Count how many expenses have this tag
      const matchingExpenses = expenses.filter((expense) => {
        const hasTag = checkIfExpenseHasTag(expense, tagFilter)
        if (hasTag) {
          console.log(`✅ Expense ${expense.id} has tag ${tagFilter}`)
        }
        return hasTag
      })

      console.log(`📊 Found ${matchingExpenses.length} expenses with tag ${tagFilter}`)
    }
  }, [tagFilter, expenses])

  // Create lookup maps for better performance
  const categoryMap = useMemo(() => {
    return categories.reduce(
      (acc, category) => {
        acc[category.id] = category
        return acc
      },
      {} as Record<string, any>,
    )
  }, [categories])

  const tagMap = useMemo(() => {
    return tags.reduce(
      (acc, tag) => {
        acc[tag.id] = tag
        return acc
      },
      {} as Record<string, any>,
    )
  }, [tags])

  // Helper function to get category name and color
  const getCategoryInfo = useCallback(
    (categoryId: string) => {
      const category = categoryMap[categoryId]
      return {
        name: category?.name || "Uncategorized",
        color: category?.color || "#e2e8f0",
        icon: category?.icon || "📁",
      }
    },
    [categoryMap],
  )

  // Helper function to get tag name and color
  const getTagInfo = useCallback(
    (tagId: string) => {
      const tag = tagMap[tagId]
      return {
        name: tag?.name || tagId,
        color: tag?.color || "#e2e8f0",
      }
    },
    [tagMap],
  )

  // Helper function to check if an expense has a specific tag
  const checkIfExpenseHasTag = useCallback(
    (expense: any, tagId: string) => {
      console.log(`🔍 Checking expense "${expense.title}" for tag ID "${tagId}"`)

      // Get the tag name from the tag ID
      const selectedTagName = getTagInfo(tagId).name
      console.log(`🏷️ Looking for tag name: "${selectedTagName}"`)
      console.log(`📋 Expense tags:`, expense.tags)

      // If no tags property, return false
      if (!expense.tags) {
        console.log(`❌ No tags property found`)
        return false
      }

      // Handle different possible formats of tags
      if (Array.isArray(expense.tags)) {
        // Check if any of the expense's tag names match the selected tag name
        const hasTag = expense.tags.includes(selectedTagName)
        console.log(`🔍 Array check for "${selectedTagName}": ${hasTag}`)
        return hasTag
      } else if (typeof expense.tags === "string") {
        // If tags is a comma-separated string
        const tagArray = expense.tags.split(",").map((t) => t.trim())
        const hasTag = tagArray.includes(selectedTagName)
        console.log(`🔍 String check for "${selectedTagName}": ${hasTag}, split into:`, tagArray)
        return hasTag
      } else if (typeof expense.tags === "object" && expense.tags !== null) {
        // If tags is an object, check values
        const hasTag = Object.values(expense.tags).includes(selectedTagName)
        console.log(`🔍 Object check for "${selectedTagName}": ${hasTag}`)
        return hasTag
      }

      console.log(`❌ Unknown tags format:`, typeof expense.tags)
      return false
    },
    [getTagInfo],
  )

  const handleSort = (field: "date" | "title" | "amount" | "category") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const getSortIcon = (field: "date" | "title" | "amount" | "category") => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  // Filter expenses based on search query, filters, and date range
  const sortedAndFilteredExpenses = useMemo(() => {
    console.log(`🔍 [ExpenseList] Filtering ${expenses.length} total expenses`)
    console.log(`🏷️ Current tag filter: ${tagFilter}`)

    const filtered = expenses.filter((expense) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchQuery.toLowerCase())

      // Category filter
      const matchesCategory = categoryFilter === "all" || expense.category_id === categoryFilter

      // Tag filter
      const matchesTag = tagFilter === "all" || checkIfExpenseHasTag(expense, tagFilter)

      // Date range filter
      let expenseDate
      try {
        expenseDate = new Date(expense.date)
        // Check if date is valid
        if (isNaN(expenseDate.getTime())) {
          console.warn(`Invalid date for expense ${expense.id}: ${expense.date}`)
          return false
        }
      } catch (error) {
        console.error(`Error parsing date for expense ${expense.id}: ${expense.date}`, error)
        return false
      }

      const matchesDateRange =
        dateRange.from && dateRange.to
          ? isWithinInterval(expenseDate, { start: dateRange.from, end: dateRange.to })
          : true

      return matchesSearch && matchesCategory && matchesTag && matchesDateRange
    })

    console.log(`✅ [ExpenseList] Filtered to ${filtered.length} expenses`)

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case "date":
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case "title":
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case "amount":
          aValue = a.amount
          bValue = b.amount
          break
        case "category":
          aValue = getCategoryInfo(a.category_id).name.toLowerCase()
          bValue = getCategoryInfo(b.category_id).name.toLowerCase()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [
    expenses,
    searchQuery,
    categoryFilter,
    tagFilter,
    dateRange,
    sortField,
    sortDirection,
    getCategoryInfo,
    checkIfExpenseHasTag,
  ])

  // Pagination logic
  const totalPages = Math.ceil(sortedAndFilteredExpenses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedExpenses = sortedAndFilteredExpenses.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter, tagFilter, dateRange])

  const handleEdit = (expense: any) => {
    setEditingExpense(expense)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (expense: any) => {
    setDeletingExpense(expense)
    setDeleteConfirmOpen(expense.id)
  }

  const handleDeleteConfirm = async () => {
    if (deleteConfirmOpen) {
      try {
        await deleteExpense(deleteConfirmOpen)
        toast({
          title: "Expense deleted",
          description: `"${deletingExpense?.title}" has been deleted successfully.`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete expense. Please try again.",
          variant: "destructive",
        })
      } finally {
        setDeleteConfirmOpen(null)
        setDeletingExpense(null)
      }
    }
  }

  const handleEditSuccess = () => {
    setIsDialogOpen(false)
    setEditingExpense(null)
    toast({
      title: "Expense updated",
      description: "Your expense has been updated successfully.",
    })
  }

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false)
    toast({
      title: "Expense added",
      description: "Your expense has been added successfully.",
    })
  }

  // Format currency
  const formatCurrency = (amount: number, currencyCode = "EGP") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(amount)
  }

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, sortedAndFilteredExpenses.length)} of{" "}
          {sortedAndFilteredExpenses.length} entries
        </p>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => {
            setItemsPerPage(Number.parseInt(value, 10))
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-[70px]">
            <span>{itemsPerPage}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">per page</span>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center space-x-1">
          <span className="text-sm text-muted-foreground">Page</span>
          <Input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = Number.parseInt(e.target.value, 10)
              if (page >= 1 && page <= totalPages) {
                setCurrentPage(page)
              }
            }}
            className="w-16 h-8 text-center"
          />
          <span className="text-sm text-muted-foreground">of {totalPages}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  if (loading) {
    return <div className="text-center py-8">Loading expenses...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        {/* Search and View Toggle */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search expenses..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>{categoryFilter !== "all" ? getCategoryInfo(categoryFilter).name : "All Categories"}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>{tagFilter !== "all" ? getTagInfo(tagFilter).name : "All Tags"}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ViewToggle value={viewMode} onChange={(value) => setViewMode(value as "cards" | "list" | "grid")} />
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Date Range:</span>
          </div>
          <div className="flex items-center gap-2">
            <SimpleDateRangePicker value={dateRange} onChange={setDateRange} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date()
                setDateRange({
                  from: startOfMonth(today),
                  to: endOfMonth(today),
                })
              }}
            >
              Current Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDateRange({
                  from: undefined,
                  to: undefined,
                })
              }}
            >
              All Dates
            </Button>
          </div>
        </div>
      </div>

   {/*    Debug Info - Remove this after fixing
      {tagFilter !== "all" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-yellow-800">Debug Info:</h3>
          <p className="text-sm text-yellow-700">Selected tag ID: {tagFilter}</p>
          <p className="text-sm text-yellow-700">Selected tag name: {getTagInfo(tagFilter).name}</p>
          <p className="text-sm text-yellow-700">Total expenses: {expenses.length}</p>
          <p className="text-sm text-yellow-700">Filtered expenses: {sortedAndFilteredExpenses.length}</p>
          {expenses.slice(0, 3).map((exp, i) => (
            <div key={i} className="text-xs text-yellow-600 mt-1">
              Expense {i + 1}: "{exp.title}" - Tags: {JSON.stringify(exp.tags)}
            </div>
          ))}
        </div>
      )} */}

      {/* No expenses message */}
      {sortedAndFilteredExpenses.length === 0 && (
        <div className="text-center py-8 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No expenses found.</p>
        </div>
      )}

      {/* List View (Default) */}
      {viewMode === "list" && sortedAndFilteredExpenses.length > 0 && (
        <>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-2 px-4 font-medium text-sm">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("title")}
                        className="h-auto p-0 font-medium hover:bg-transparent text-sm"
                      >
                        Title {getSortIcon("title")}
                      </Button>
                    </th>
                    <th className="text-left py-2 px-4 font-medium text-sm">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("category")}
                        className="h-auto p-0 font-medium hover:bg-transparent text-sm"
                      >
                        Category {getSortIcon("category")}
                      </Button>
                    </th>
                    <th className="text-right py-2 px-4 font-medium text-sm">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("amount")}
                        className="h-auto p-0 font-medium hover:bg-transparent text-sm"
                      >
                        Amount {getSortIcon("amount")}
                      </Button>
                    </th>
                    <th className="text-left py-2 px-4 font-medium text-sm">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("date")}
                        className="h-auto p-0 font-medium hover:bg-transparent text-sm"
                      >
                        Date {getSortIcon("date")}
                      </Button>
                    </th>
                    <th className="text-left py-2 px-4 font-medium text-sm">Tags</th>
                    <th className="text-right py-2 px-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedExpenses.map((expense) => {
                    const categoryInfo = getCategoryInfo(expense.category_id)

                    return (
                      <tr key={expense.id} className="border-t hover:bg-muted/30">
                        <td className="py-2 px-4">
                          <div className="font-medium max-w-[250px] truncate">{expense.title}</div>
                          {expense.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">{expense.description}</div>
                          )}
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryInfo.color }} />
                            <span>{categoryInfo.name}</span>
                          </div>
                        </td>
                        <td className="py-2 px-4 text-right">
                          {formatCurrency(expense.amount, expense.currency_code)}
                        </td>
                        <td className="py-2 px-4">{format(new Date(expense.date), "MMM d, yyyy")}</td>
                        <td className="py-2 px-4">
                          <div className="flex flex-wrap gap-1">
                            {expense.tags &&
                              Array.isArray(expense.tags) &&
                              expense.tags.slice(0, 2).map((tagId) => {
                                const tagInfo = getTagInfo(tagId)
                                return (
                                  <Badge
                                    key={tagId}
                                    variant="outline"
                                    style={{
                                      backgroundColor: `${tagInfo.color}20`,
                                      borderColor: tagInfo.color,
                                    }}
                                  >
                                    {tagInfo.name}
                                  </Badge>
                                )
                              })}
                            {expense.tags && Array.isArray(expense.tags) && expense.tags.length > 2 && (
                              <Badge variant="outline">+{expense.tags.length - 2} more</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(expense)}
                              className="text-red-600"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <PaginationControls />
        </>
      )}

      {/* Cards View */}
      {viewMode === "cards" && sortedAndFilteredExpenses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedExpenses.map((expense) => {
            const categoryInfo = getCategoryInfo(expense.category_id)

            return (
              <Card key={expense.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{expense.title}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(expense)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(expense)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryInfo.color }} />
                      <span className="text-sm text-muted-foreground">{categoryInfo.name}</span>
                    </div>

                    <div className="mt-4">
                      <div className="text-2xl font-bold">{formatCurrency(expense.amount, expense.currency_code)}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(expense.date), "MMM d, yyyy")}
                      </div>
                    </div>

                    {expense.description && (
                      <div className="mt-2 text-sm text-muted-foreground line-clamp-2">{expense.description}</div>
                    )}

                    {expense.tags && Array.isArray(expense.tags) && expense.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {expense.tags.slice(0, 3).map((tagId) => {
                          const tagInfo = getTagInfo(tagId)
                          return (
                            <Badge
                              key={tagId}
                              variant="outline"
                              style={{
                                backgroundColor: `${tagInfo.color}20`,
                                borderColor: tagInfo.color,
                              }}
                            >
                              {tagInfo.name}
                            </Badge>
                          )
                        })}
                        {expense.tags.length > 3 && <Badge variant="outline">+{expense.tags.length - 3} more</Badge>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
      {viewMode === "cards" && sortedAndFilteredExpenses.length > 0 && <PaginationControls />}

      {/* Grid View */}
      {viewMode === "grid" && sortedAndFilteredExpenses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {paginatedExpenses.map((expense) => {
            const categoryInfo = getCategoryInfo(expense.category_id)

            return (
              <div key={expense.id} className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="truncate font-medium">{expense.title}</div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(expense)}>
                        <Edit className="mr-2 h-3 w-3" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(expense)} className="text-red-600">
                        <Trash className="mr-2 h-3 w-3" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryInfo.color }} />
                  <span className="text-xs text-muted-foreground">{categoryInfo.name}</span>
                </div>

                <div className="mt-2">
                  <div className="font-bold">{formatCurrency(expense.amount, expense.currency_code)}</div>
                  <div className="text-xs text-muted-foreground">{format(new Date(expense.date), "MMM d, yyyy")}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {viewMode === "grid" && sortedAndFilteredExpenses.length > 0 && <PaginationControls />}

      {/* Add Expense Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm onSuccess={handleAddSuccess} onCancel={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm expense={editingExpense} onSuccess={handleEditSuccess} onCancel={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmOpen} onOpenChange={(open) => !open && setDeleteConfirmOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
