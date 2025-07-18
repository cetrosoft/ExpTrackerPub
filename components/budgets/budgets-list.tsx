"use client"

import { useState } from "react"
import { useBudgets } from "@/contexts/budgets-context"
import { useCategories } from "@/contexts/categories-context"
import { cn } from "@/lib/utils"
import { Plus, Edit, Trash, List, LayoutGrid, Search, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { BudgetForm } from "@/components/budgets/budget-form"
import { BudgetProgress } from "@/components/budgets/budget-progress"
import { CategoryIcon } from "@/components/categories/category-icon"

export function BudgetsList({ dictionary, lang }: { dictionary: any; lang: string }) {
  const { budgets, deleteBudget, loading } = useBudgets()
  const { categories } = useCategories()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards")
  const [searchQuery, setSearchQuery] = useState("")
  const isRtl = lang === "ar"

  const handleDeleteConfirm = () => {
    if (deleteConfirmOpen) {
      deleteBudget(deleteConfirmOpen)
      setDeleteConfirmOpen(null)
    }
  }

  const budgetToEdit = editingBudget ? budgets.find((b) => b.id === editingBudget) : undefined

  // Filter budgets based on search query
  const filteredBudgets = budgets.filter(
    (budget) =>
      searchQuery === "" ||
      budget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (budget.category?.name || "").toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
      </div>
    )
  }

  const BudgetCard = ({ budget }: { budget: any }) => {
    const category = categories.find((c) => c.id === budget.category_id)

    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className={cn("flex items-center justify-between", isRtl && "flex-row-reverse")}>
            <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}>
              {category && (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                >
                  <CategoryIcon name={category.icon} className="w-5 h-5" />
                </div>
              )}
              <div className={cn("space-y-1", isRtl && "text-right")}>
                <h3 className="font-medium">{budget.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {budget.period}
                  </Badge>
                  {budget.is_over_budget && (
                    <Badge variant="destructive" className="text-xs gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Over Budget
                    </Badge>
                  )}
                  {budget.is_near_limit && !budget.is_over_budget && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Near Limit
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setEditingBudget(budget.id)} className="h-8 w-8">
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit budget</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteConfirmOpen(budget.id)}
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash className="h-4 w-4" />
                <span className="sr-only">Delete budget</span>
              </Button>
            </div>
          </div>

          <BudgetProgress budget={budget} />
        </div>
      </Card>
    )
  }

  const BudgetRow = ({ budget }: { budget: any }) => {
    const category = categories.find((c) => c.id === budget.category_id)

    return (
      <tr className="border-t hover:bg-muted/30">
        <td className="py-4 px-4">
          <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}>
            {category && (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
              >
                <CategoryIcon name={category.icon} className="w-4 h-4" />
              </div>
            )}
            <div className={cn("space-y-1", isRtl && "text-right")}>
              <div className="font-medium">{budget.name}</div>
              <div className="text-sm text-muted-foreground">{category?.name || "Unknown Category"}</div>
            </div>
          </div>
        </td>
        <td className="py-4 px-4">
          <Badge variant="outline" className="text-xs">
            {budget.period}
          </Badge>
        </td>
        <td className="py-4 px-4">
          <div className="text-right">
            <div className="font-medium">${budget.amount.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">${(budget.spent_amount || 0).toFixed(2)} spent</div>
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="space-y-1">
            {budget.is_over_budget && (
              <Badge variant="destructive" className="text-xs gap-1">
                <AlertTriangle className="w-3 h-3" />
                Over Budget
              </Badge>
            )}
            {budget.is_near_limit && !budget.is_over_budget && (
              <Badge variant="secondary" className="text-xs gap-1">
                <AlertTriangle className="w-3 h-3" />
                Near Limit
              </Badge>
            )}
            {!budget.is_over_budget && !budget.is_near_limit && (
              <Badge variant="outline" className="text-xs">
                On Track
              </Badge>
            )}
          </div>
        </td>
        <td className="py-4 px-4 text-right">
          <div className="flex items-center gap-1 justify-end">
            <Button variant="ghost" size="icon" onClick={() => setEditingBudget(budget.id)} className="h-8 w-8">
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit budget</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteConfirmOpen(budget.id)}
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete budget</span>
            </Button>
          </div>
        </td>
      </tr>
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading budgets...</div>
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className={cn("flex items-center justify-between", isRtl && "flex-row-reverse")}>
          <h1 className="text-2xl font-bold">Budget Management</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Budget
          </Button>
        </div>

        {/* Search and View Toggle */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search budgets..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ViewToggle value={viewMode} onChange={(value) => setViewMode(value as "cards" | "list")} />
        </div>
      </div>

      {/* Budgets List */}
      <div className="space-y-4">
        {filteredBudgets.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No budgets found matching your search."
                : "No budgets created yet. Create your first budget to start tracking your spending."}
            </p>
          </Card>
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBudgets.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} />
            ))}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium text-sm">Budget</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Period</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBudgets.map((budget) => (
                    <BudgetRow key={budget.id} budget={budget} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Budget Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Budget</DialogTitle>
          </DialogHeader>
          <BudgetForm
            dictionary={dictionary}
            lang={lang}
            onSuccess={() => setIsAddDialogOpen(false)}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Budget Dialog */}
      <Dialog open={!!editingBudget} onOpenChange={(open) => !open && setEditingBudget(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          {budgetToEdit && (
            <BudgetForm
              dictionary={dictionary}
              lang={lang}
              budget={budgetToEdit}
              onSuccess={() => setEditingBudget(null)}
              onCancel={() => setEditingBudget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmOpen} onOpenChange={(open) => !open && setDeleteConfirmOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this budget? This action cannot be undone.
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
