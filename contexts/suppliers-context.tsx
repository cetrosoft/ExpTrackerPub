"use client"

import type React from "react"
<<<<<<< HEAD
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"
=======
import { createContext, useContext, useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d

export interface Supplier {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
<<<<<<< HEAD
  contact_person?: string // Changed to snake_case to match database
  notes?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
=======
  contactPerson?: string
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
}

interface SuppliersContextType {
  suppliers: Supplier[]
<<<<<<< HEAD
  isLoading: boolean
  addSupplier: (supplier: Omit<Supplier, "id" | "created_at" | "updated_at">) => Promise<void>
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>
  deleteSupplier: (id: string) => Promise<void>
=======
  addSupplier: (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => void
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void
  deleteSupplier: (id: string) => void
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
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

<<<<<<< HEAD
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
=======
// Sample suppliers for demonstration
const sampleSuppliers: Supplier[] = [
  {
    id: "supplier_1",
    name: "Tech Solutions Ltd",
    email: "contact@techsolutions.com",
    phone: "+1-555-0123",
    address: "123 Business St, Tech City, TC 12345",
    contactPerson: "John Smith",
    notes: "Reliable technology supplier",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "supplier_2",
    name: "Office Supplies Co",
    email: "orders@officesupplies.com",
    phone: "+1-555-0456",
    address: "456 Supply Ave, Business Park, BP 67890",
    contactPerson: "Sarah Johnson",
    notes: "Office equipment and supplies",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "supplier_3",
    name: "Catering Services",
    email: "info@catering.com",
    phone: "+1-555-0789",
    address: "789 Food St, Culinary District, CD 13579",
    contactPerson: "Mike Wilson",
    notes: "Corporate catering and events",
    isActive: false,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
]

export function SuppliersProvider({ children }: { children: React.ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(sampleSuppliers)
  const { toast } = useToast()

  const addSupplier = useCallback(
    (supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => {
      // Check if supplier name already exists
      const existingSupplier = suppliers.find(
        (supplier) => supplier.name.toLowerCase() === supplierData.name.toLowerCase(),
      )

      if (existingSupplier) {
        toast({
          title: "Error",
          description: "A supplier with this name already exists",
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
          variant: "destructive",
        })
        return
      }

<<<<<<< HEAD
      try {
        // Check if supplier name already exists
        const existingSupplier = suppliers.find(
          (supplier) => supplier.name.toLowerCase() === supplierData.name.toLowerCase(),
=======
      const newSupplier: Supplier = {
        ...supplierData,
        id: `supplier_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setSuppliers((prev) => [...prev, newSupplier])
      toast({
        title: "Success",
        description: "Supplier added successfully",
      })
    },
    [suppliers, toast],
  )

  const updateSupplier = useCallback(
    (id: string, supplierData: Partial<Supplier>) => {
      // Check if new name conflicts with existing suppliers
      if (supplierData.name) {
        const existingSupplier = suppliers.find(
          (supplier) => supplier.id !== id && supplier.name.toLowerCase() === supplierData.name.toLowerCase(),
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
        )

        if (existingSupplier) {
          toast({
            title: "Error",
            description: "A supplier with this name already exists",
            variant: "destructive",
          })
          return
        }
<<<<<<< HEAD

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
=======
      }

      setSuppliers((prev) =>
        prev.map((supplier) =>
          supplier.id === id ? { ...supplier, ...supplierData, updatedAt: new Date().toISOString() } : supplier,
        ),
      )

      toast({
        title: "Success",
        description: "Supplier updated successfully",
      })
    },
    [suppliers, toast],
  )

  const deleteSupplier = useCallback(
    (id: string) => {
      setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id))
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      })
    },
    [toast],
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
  )

  const getSupplierById = useCallback(
    (id: string) => {
      return suppliers.find((supplier) => supplier.id === id)
    },
    [suppliers],
  )

  const getActiveSuppliers = useCallback(() => {
<<<<<<< HEAD
    return suppliers.filter((supplier) => supplier.is_active)
=======
    return suppliers.filter((supplier) => supplier.isActive)
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
  }, [suppliers])

  const value: SuppliersContextType = {
    suppliers,
<<<<<<< HEAD
    isLoading,
=======
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
    getActiveSuppliers,
  }

  return <SuppliersContext.Provider value={value}>{children}</SuppliersContext.Provider>
}
