"use client"

import { useState } from "react"
import { useSuppliers } from "@/contexts/suppliers-context"
import { cn } from "@/lib/utils"
import { Plus, Edit, Trash, MoreHorizontal, Building, Mail, Phone, MapPin, User, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SupplierForm } from "@/components/suppliers/supplier-form"
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

export function SuppliersList({ dictionary, lang }: { dictionary: any; lang: string }) {
  const { suppliers, deleteSupplier, updateSupplier } = useSuppliers()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<string | null>(null)
  const isRtl = lang === "ar"

  const handleDeleteConfirm = () => {
    if (deleteConfirmOpen) {
      deleteSupplier(deleteConfirmOpen)
      setDeleteConfirmOpen(null)
    }
  }

  const toggleSupplierStatus = (id: string, isActive: boolean) => {
    updateSupplier(id, { isActive: !isActive })
  }

  const supplierToEdit = editingSupplier ? suppliers.find((s) => s.id === editingSupplier) : undefined

  const SupplierCard = ({ supplier }: { supplier: any }) => {
    return (
      <Card className="p-4">
        <div className={cn("flex items-start justify-between", isRtl && "flex-row-reverse")}>
          <div className={cn("flex items-start gap-3 flex-1", isRtl && "flex-row-reverse")}>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div className={cn("space-y-2 flex-1", isRtl && "text-right")}>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{supplier.name}</h3>
                <Badge variant={supplier.isActive ? "default" : "secondary"}>
                  {supplier.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              {supplier.contactPerson && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{supplier.contactPerson}</span>
                </div>
              )}

              {supplier.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{supplier.email}</span>
                </div>
              )}

              {supplier.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{supplier.phone}</span>
                </div>
              )}

              {supplier.address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-2">{supplier.address}</span>
                </div>
              )}

              {supplier.notes && <p className="text-sm text-muted-foreground line-clamp-2">{supplier.notes}</p>}
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
              <DropdownMenuItem onClick={() => setEditingSupplier(supplier.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Supplier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleSupplierStatus(supplier.id, supplier.isActive)}>
                {supplier.isActive ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {supplier.isActive ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteConfirmOpen(supplier.id)} className="text-red-600">
                <Trash className="mr-2 h-4 w-4" />
                Delete Supplier
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className={cn("flex items-center justify-between", isRtl && "flex-row-reverse")}>
        <h1 className="text-2xl font-bold">Suppliers Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {suppliers.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No suppliers found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {suppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))}
        </div>
      )}

      {/* Add Supplier Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
          </DialogHeader>
          <SupplierForm
            dictionary={dictionary}
            lang={lang}
            onSuccess={() => setIsAddDialogOpen(false)}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog open={!!editingSupplier} onOpenChange={(open) => !open && setEditingSupplier(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          {supplierToEdit && (
            <SupplierForm
              dictionary={dictionary}
              lang={lang}
              supplier={supplierToEdit}
              onSuccess={() => setEditingSupplier(null)}
              onCancel={() => setEditingSupplier(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmOpen} onOpenChange={(open) => !open && setDeleteConfirmOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this supplier? This action cannot be undone.
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
