"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"

export interface Supplier {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  contact_person?: string // Changed to snake_case to match database
  notes?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

interface SuppliersContextType {
  suppliers: Supplier[]
  isLoading: boolean
  addSupplier: (supplier: Omit<Supplier, "id" | "created_at" | "updated_at">) => Promise<void>
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>
  deleteSupplier: (id: string) => Promise<void>
  getSupplierById: (id: string) => Supplier | undefined
  getActiveSuppliers: () => Supplier[]
}

const SuppliersContext = createContext<SuppliersContextType | undefined>(undefined)

export function useSuppliers() {
  const context = useContext(SuppliersContext)
  if (!context) {
    throw new Error("useSuppliers must be used within a SuppliersProvider")
  }
  return context
}

export function SuppliersProvider({ children }: { children: React.ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { supabase } = useSupabase()
  const { user } = useAuth()

  // Fetch suppliers from Supabase
  useEffect(() => {
    async function fetchSuppliers() {
      if (!user) {
        setSuppliers([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        console.log("Fetching suppliers for user:", user.id)

        const { data, error } = await supabase
          .from("suppliers")
          .select("*")
          .eq("user_id", user.id)
          .order("name", { ascending: true })

        if (error) {
          console.error("Error fetching suppliers:", error)
          toast({
            title: "Error",
            description: "Failed to load suppliers",
            variant: "destructive",
          })
          return
        }

        console.log("Fetched suppliers:", data)
        setSuppliers(data || [])
      } catch (error) {
        console.error("Error in fetchSuppliers:", error)
        toast({
          title: "Error",
          description: "Failed to load suppliers",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuppliers()
  }, [supabase, user, toast])

  const addSupplier = useCallback(
    async (supplierData: Omit<Supplier, "id" | "created_at" | "updated_at">) => {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be signed in to add suppliers",
          variant: "destructive",
        })
        return
      }

      try {
        // Check if supplier name already exists
        const existingSupplier = suppliers.find(
          (supplier) => supplier.name.toLowerCase() === supplierData.name.toLowerCase(),
        )

        if (existingSupplier) {
          toast({
            title: "Error",
            description: "A supplier with this name already exists",
            variant: "destructive",
          })
          return
        }

        const newSupplier = {
          name: supplierData.name,
          email: supplierData.email || null,
          phone: supplierData.phone || null,
          address: supplierData.address || null,
          contact_person: supplierData.contact_person || null, // Using snake_case
          notes: supplierData.notes || null,
          is_active: supplierData.is_active,
          user_id: user.id,
        }

        console.log("Adding supplier:", newSupplier)
        const { data, error } = await supabase.from("suppliers").insert(newSupplier).select().single()

        if (error) {
          console.error("Error adding supplier:", error)
          toast({
            title: "Error",
            description: `Failed to add supplier: ${error.message}`,
            variant: "destructive",
          })
          return
        }

        console.log("Supplier added:", data)
        setSuppliers((prev) => [...prev, data])
        toast({
          title: "Success",
          description: "Supplier added successfully",
        })
      } catch (error) {
        console.error("Error in addSupplier:", error)
        toast({
          title: "Error",
          description: "Failed to add supplier",
          variant: "destructive",
        })
      }
    },
    [suppliers, toast, supabase, user],
  )

  const updateSupplier = useCallback(
    async (id: string, supplierData: Partial<Supplier>) => {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be signed in to update suppliers",
          variant: "destructive",
        })
        return
      }

      try {
        // Check if new name conflicts with existing suppliers
        if (supplierData.name) {
          const existingSupplier = suppliers.find(
            (supplier) => supplier.id !== id && supplier.name.toLowerCase() === supplierData.name.toLowerCase(),
          )

          if (existingSupplier) {
            toast({
              title: "Error",
              description: "A supplier with this name already exists",
              variant: "destructive",
            })
            return
          }
        }

        const updates = {
          ...supplierData,
          updated_at: new Date().toISOString(),
        }

        console.log("Updating supplier:", id, updates)
        const { data, error } = await supabase.from("suppliers").update(updates).eq("id", id).select().single()

        if (error) {
          console.error("Error updating supplier:", error)
          toast({
            title: "Error",
            description: `Failed to update supplier: ${error.message}`,
            variant: "destructive",
          })
          return
        }

        console.log("Supplier updated:", data)
        setSuppliers((prev) => prev.map((supplier) => (supplier.id === id ? { ...supplier, ...data } : supplier)))
        toast({
          title: "Success",
          description: "Supplier updated successfully",
        })
      } catch (error) {
        console.error("Error in updateSupplier:", error)
        toast({
          title: "Error",
          description: "Failed to update supplier",
          variant: "destructive",
        })
      }
    },
    [suppliers, toast, supabase, user],
  )

  const deleteSupplier = useCallback(
    async (id: string) => {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be signed in to delete suppliers",
          variant: "destructive",
        })
        return
      }

      try {
        console.log("Deleting supplier:", id)
        const { error } = await supabase.from("suppliers").delete().eq("id", id)

        if (error) {
          console.error("Error deleting supplier:", error)
          toast({
            title: "Error",
            description: `Failed to delete supplier: ${error.message}`,
            variant: "destructive",
          })
          return
        }

        setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id))
        toast({
          title: "Success",
          description: "Supplier deleted successfully",
        })
      } catch (error) {
        console.error("Error in deleteSupplier:", error)
        toast({
          title: "Error",
          description: "Failed to delete supplier",
          variant: "destructive",
        })
      }
    },
    [toast, supabase, user],
  )

  const getSupplierById = useCallback(
    (id: string) => {
      return suppliers.find((supplier) => supplier.id === id)
    },
    [suppliers],
  )

  const getActiveSuppliers = useCallback(() => {
    return suppliers.filter((supplier) => supplier.is_active)
  }, [suppliers])

  const value: SuppliersContextType = {
    suppliers,
    isLoading,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
    getActiveSuppliers,
  }

  return <SuppliersContext.Provider value={value}>{children}</SuppliersContext.Provider>
}
