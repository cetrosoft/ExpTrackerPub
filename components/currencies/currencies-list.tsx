"use client"

import { useState } from "react"
import { useCurrencies } from "@/contexts/currencies-context"
import { cn } from "@/lib/utils"
import { Plus, Edit, Trash, MoreHorizontal, DollarSign, Star, Eye, EyeOff, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CurrencyForm } from "@/components/currencies/currency-form"
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
import { useAuth } from "@/contexts/auth-context"

export function CurrenciesList({ dictionary, lang }: { dictionary: any; lang: string }) {
  const { currencies, deleteCurrency, updateCurrency, setDefaultCurrency } = useCurrencies()
  const { user } = useAuth()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<string | null>(null)
  const isRtl = lang === "ar"

  const handleDeleteConfirm = () => {
    if (deleteConfirmOpen) {
      deleteCurrency(deleteConfirmOpen)
      setDeleteConfirmOpen(null)
    }
  }

  const toggleCurrencyStatus = (id: string, isActive: boolean) => {
    updateCurrency(id, { isActive: !isActive })
  }

  const handleSetDefault = (id: string) => {
    setDefaultCurrency(id)
  }

  const currencyToEdit = editingCurrency ? currencies.find((c) => c.id === editingCurrency) : undefined

  // Helper function to check if currency is editable
  const isCurrencyEditable = (currency: any) => {
    // Currency is editable if user is signed in and it has a createdAt (meaning it's user-created)
    return user && currency.createdAt
  }

  const CurrencyCard = ({ currency }: { currency: any }) => {
    const isEditable = isCurrencyEditable(currency)
    const isDefaultCurrency = !currency.createdAt // Default currencies don't have createdAt

    return (
      <Card className="p-4">
        <div className={cn("flex items-center justify-between", isRtl && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-3", isRtl && "flex-row-reverse")}>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className={cn("space-y-1", isRtl && "text-right")}>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{currency.code}</h3>
                <span className="text-2xl">{currency.symbol}</span>
                {currency.isDefault && (
                  <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                    <Star className="w-3 h-3 mr-1" />
                    Default
                  </Badge>
                )}
                <Badge variant={currency.isActive ? "default" : "secondary"}>
                  {currency.isActive ? "Active" : "Inactive"}
                </Badge>
                {isDefaultCurrency && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    <Lock className="w-3 h-3 mr-1" />
                    System
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium">{currency.name}</p>
              <p className="text-sm text-muted-foreground">
                Exchange Rate: {currency.exchangeRate.toFixed(4)} (vs USD)
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRtl ? "start" : "end"}>
              {isEditable && (
                <DropdownMenuItem onClick={() => setEditingCurrency(currency.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Currency
                </DropdownMenuItem>
              )}
              {isEditable && !currency.isDefault && (
                <DropdownMenuItem onClick={() => handleSetDefault(currency.id)}>
                  <Star className="mr-2 h-4 w-4" />
                  Set as Default
                </DropdownMenuItem>
              )}
              {isEditable && (
                <DropdownMenuItem onClick={() => toggleCurrencyStatus(currency.id, currency.isActive)}>
                  {currency.isActive ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                  {currency.isActive ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
              )}
              {isEditable && !currency.isDefault && (
                <DropdownMenuItem onClick={() => setDeleteConfirmOpen(currency.id)} className="text-red-600">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Currency
                </DropdownMenuItem>
              )}
              {!isEditable && (
                <DropdownMenuItem disabled>
                  <Lock className="mr-2 h-4 w-4" />
                  System Currency (Read-only)
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className={cn("flex items-center justify-between", isRtl && "flex-row-reverse")}>
        <h1 className="text-2xl font-bold">Currencies Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} disabled={!user}>
          <Plus className="mr-2 h-4 w-4" />
          Add Currency
        </Button>
      </div>

      {!user && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-blue-800 text-sm">
            <Lock className="w-4 h-4 inline mr-2" />
            Sign in to add custom currencies and modify settings
          </p>
        </Card>
      )}

      {currencies.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No currencies found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currencies.map((currency) => (
            <CurrencyCard key={currency.id} currency={currency} />
          ))}
        </div>
      )}

      {/* Add Currency Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Currency</DialogTitle>
          </DialogHeader>
          <CurrencyForm
            dictionary={dictionary}
            lang={lang}
            onSuccess={() => setIsAddDialogOpen(false)}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Currency Dialog */}
      <Dialog open={!!editingCurrency} onOpenChange={(open) => !open && setEditingCurrency(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Currency</DialogTitle>
          </DialogHeader>
          {currencyToEdit && (
            <CurrencyForm
              dictionary={dictionary}
              lang={lang}
              currency={currencyToEdit}
              onSuccess={() => setEditingCurrency(null)}
              onCancel={() => setEditingCurrency(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmOpen} onOpenChange={(open) => !open && setDeleteConfirmOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Currency</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this currency? This action cannot be undone.
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
