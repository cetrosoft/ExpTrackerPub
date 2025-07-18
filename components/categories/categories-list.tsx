"use client"

import { useState } from "react"
import { useCategories } from "@/contexts/categories-context"
import { useExpenses } from "@/contexts/expenses-context"
import { cn } from "@/lib/utils"
import { Plus, Edit, Trash, List, LayoutGrid, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CategoryForm } from "@/components/categories/category-form"
import { CategoryIcon } from "@/components/categories/category-icon"
import { Input } from "@/components/ui/input"
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

export function CategoriesList({ dictionary, lang }: { dictionary: any; lang: string }) {
  const { categories, deleteCategory, getDefaultCategories, getCustomCategories } = useCategories()
  const { expenses } = useExpenses()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards")
  const [searchQuery, setSearchQuery] = useState("")
  const isRtl = lang === "ar"

  const defaultCategories = getDefaultCategories()
  const customCategories = getCustomCategories()

  const getCategoryUsageCount = (categoryId: string) => {
    return expenses.filter((expense) => expense.category === categoryId).length
  }

  const handleDeleteConfirm = () => {
    if (deleteConfirmOpen) {
      const usageCount = getCategoryUsageCount(deleteConfirmOpen)
      if (usageCount > 0) {
        // Show warning about category being in use
        return
      }
      deleteCategory(deleteConfirmOpen)
      setDeleteConfirmOpen(null)
    }
  }

  const categoryToEdit = editingCategory ? categories.find((c) => c.id === editingCategory) : undefined

  // Filter categories based on search query
  const filteredDefaultCategories = defaultCategories.filter(
    (category) =>
      searchQuery === "" ||
      (dictionary.categories[category.id] || category.name).toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredCustomCategories = customCategories.filter(
    (category) => searchQuery === "" || category.name.toLowerCase().includes(searchQuery.toLowerCase()),
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

  const CategoryCard = ({ category }: { category: any }) => {
    const usageCount = getCategoryUsageCount(category.id)
    const canEdit = !category.isDefault
    const canDelete = !category.isDefault && usageCount === 0

    return (
      <Card className="p-4">
        <div className={cn("flex items-center justify-between", isRtl && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              <CategoryIcon name={category.icon} className="w-5 h-5" />
            </div>
            <div className={cn("space-y-1", isRtl && "text-right")}>
              <h3 className="font-medium">{dictionary.categories[category.id] || category.name}</h3>
              <div className="flex items-center gap-2">
                {category.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    {dictionary.categories_management.default_categories.split(" ")[0]}
                  </Badge>
                )}
                {usageCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {usageCount} {usageCount === 1 ? "expense" : "expenses"}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingCategory(category.id)}
              disabled={!canEdit}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit category</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteConfirmOpen(category.id)}
              disabled={!canDelete}
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete category</span>
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  const CategoryRow = ({ category }: { category: any }) => {
    const usageCount = getCategoryUsageCount(category.id)
    const canEdit = !category.isDefault
    const canDelete = !category.isDefault && usageCount === 0

    return (
      <tr className="border-t hover:bg-muted/30">
        <td className="py-2 px-4">
          <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              <CategoryIcon name={category.icon} className="w-4 h-4" />
            </div>
            <div className={cn("space-y-1", isRtl && "text-right")}>
              <div className="font-medium">{dictionary.categories[category.id] || category.name}</div>
            </div>
          </div>
        </td>
        <td className="py-2 px-4">
          {category.isDefault && (
            <Badge variant="secondary" className="text-xs">
              {dictionary.categories_management.default_categories.split(" ")[0]}
            </Badge>
          )}
          {!category.isDefault && (
            <Badge variant="outline" className="text-xs">
              Custom
            </Badge>
          )}
        </td>
        <td className="py-2 px-4">
          {usageCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {usageCount} {usageCount === 1 ? "expense" : "expenses"}
            </Badge>
          )}
        </td>
        <td className="py-2 px-4 text-right">
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingCategory(category.id)}
              disabled={!canEdit}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit category</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteConfirmOpen(category.id)}
              disabled={!canDelete}
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete category</span>
            </Button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className={cn("flex items-center justify-between", isRtl && "flex-row-reverse")}>
          <h1 className="text-2xl font-bold">{dictionary.categories_management.title}</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {dictionary.categories_management.add_category}
          </Button>
        </div>

        {/* Search and View Toggle */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search categories..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ViewToggle value={viewMode} onChange={(value) => setViewMode(value as "cards" | "list")} />
        </div>
      </div>

      {/* Default Categories */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{dictionary.categories_management.default_categories}</h2>
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDefaultCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-2 px-4 font-medium text-sm">Category</th>
                    <th className="text-left py-2 px-4 font-medium text-sm">Type</th>
                    <th className="text-left py-2 px-4 font-medium text-sm">Usage</th>
                    <th className="text-right py-2 px-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDefaultCategories.map((category) => (
                    <CategoryRow key={category.id} category={category} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Custom Categories */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{dictionary.categories_management.custom_categories}</h2>
        {filteredCustomCategories.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No categories found matching your search."
                : dictionary.categories_management.no_categories}
            </p>
          </Card>
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-2 px-4 font-medium text-sm">Category</th>
                    <th className="text-left py-2 px-4 font-medium text-sm">Type</th>
                    <th className="text-left py-2 px-4 font-medium text-sm">Usage</th>
                    <th className="text-right py-2 px-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomCategories.map((category) => (
                    <CategoryRow key={category.id} category={category} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{dictionary.categories_management.add_category}</DialogTitle>
          </DialogHeader>
          <CategoryForm
            dictionary={dictionary}
            lang={lang}
            onSuccess={() => setIsAddDialogOpen(false)}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{dictionary.categories_management.edit_category}</DialogTitle>
          </DialogHeader>
          {categoryToEdit && (
            <CategoryForm
              dictionary={dictionary}
              lang={lang}
              category={categoryToEdit}
              onSuccess={() => setEditingCategory(null)}
              onCancel={() => setEditingCategory(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmOpen} onOpenChange={(open) => !open && setDeleteConfirmOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionary.categories_management.delete_category}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirmOpen && getCategoryUsageCount(deleteConfirmOpen) > 0
                ? dictionary.categories_management.category_in_use
                : dictionary.categories_management.confirm_delete}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{dictionary.form.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteConfirmOpen ? getCategoryUsageCount(deleteConfirmOpen) > 0 : false}
            >
              {dictionary.form.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
