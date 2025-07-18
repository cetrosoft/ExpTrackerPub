"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  is_default: boolean
  user_id?: string
  created_at: string
  updated_at: string
}

interface CategoriesContextType {
  categories: Category[]
  loading: boolean
  addCategory: (category: Omit<Category, "id" | "created_at" | "updated_at">) => Promise<void>
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  getCategoryById: (id: string) => Category | undefined
  getCategoryByName: (name: string) => Category | undefined
  getDefaultCategories: () => Category[]
  getCustomCategories: () => Category[]
  refetch: () => Promise<void>
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined)

export function useCategories() {
  const context = useContext(CategoriesContext)
  if (!context) {
    throw new Error("useCategories must be used within a CategoriesProvider")
  }
  return context
}

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const { toast } = useToast()

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      console.log("Current user:", user?.email || "Not signed in")
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      console.log("Auth state changed:", session?.user?.email || "Signed out")
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch categories when user changes
  useEffect(() => {
    fetchCategories()
  }, [user])

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase.from("categories").select("*").order("name")

      // Get default categories and user-specific categories
      if (user) {
        query = query.or(`user_id.is.null,user_id.eq.${user.id}`)
      } else {
        query = query.is("user_id", null)
      }

      const { data, error } = await query

      if (error) throw error
      setCategories(data || [])
      console.log("Fetched categories:", data?.length || 0)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  const addCategory = useCallback(
    async (categoryData: Omit<Category, "id" | "created_at" | "updated_at">) => {
      console.log("Attempting to add category:", categoryData)
      console.log("Current user:", user?.email || "Not signed in")

      if (!user) {
        toast({
          title: "Error",
          description: "You must be signed in to add categories",
          variant: "destructive",
        })
        return
      }

      // Check if category name already exists
      const existingCategory = categories.find((cat) => cat.name.toLowerCase() === categoryData.name.toLowerCase())

      if (existingCategory) {
        toast({
          title: "Error",
          description: "A category with this name already exists",
          variant: "destructive",
        })
        return
      }

      try {
        const newCategory = {
          name: categoryData.name,
          color: categoryData.color,
          icon: categoryData.icon,
          is_default: false,
          user_id: user.id,
        }

        console.log("Inserting category:", newCategory)

        const { data, error } = await supabase.from("categories").insert([newCategory]).select().single()

        if (error) {
          console.error("Supabase error:", error)
          throw error
        }

        console.log("Category added successfully:", data)
        setCategories((prev) => [...prev, data])
        toast({
          title: "Success",
          description: "Category added successfully",
        })
      } catch (error) {
        console.error("Error adding category:", error)
        toast({
          title: "Error",
          description: `Failed to add category: ${error.message || "Unknown error"}`,
          variant: "destructive",
        })
      }
    },
    [user, categories, toast],
  )

  const updateCategory = useCallback(
    async (id: string, categoryData: Partial<Category>) => {
      const category = categories.find((cat) => cat.id === id)
      if (!category) return

      if (category.is_default) {
        toast({
          title: "Error",
          description: "Cannot edit default categories",
          variant: "destructive",
        })
        return
      }

      try {
        const { data, error } = await supabase
          .from("categories")
          .update({ ...categoryData, updated_at: new Date().toISOString() })
          .eq("id", id)
          .eq("user_id", user?.id)
          .select()
          .single()

        if (error) throw error

        setCategories((prev) => prev.map((cat) => (cat.id === id ? data : cat)))
        toast({
          title: "Success",
          description: "Category updated successfully",
        })
      } catch (error) {
        console.error("Error updating category:", error)
        toast({
          title: "Error",
          description: "Failed to update category",
          variant: "destructive",
        })
      }
    },
    [user, categories, toast],
  )

  const deleteCategory = useCallback(
    async (id: string) => {
      const category = categories.find((cat) => cat.id === id)
      if (!category) return

      if (category.is_default) {
        toast({
          title: "Error",
          description: "Cannot delete default categories",
          variant: "destructive",
        })
        return
      }

      try {
        const { error } = await supabase.from("categories").delete().eq("id", id).eq("user_id", user?.id)

        if (error) throw error

        setCategories((prev) => prev.filter((cat) => cat.id !== id))
        toast({
          title: "Success",
          description: "Category deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting category:", error)
        toast({
          title: "Error",
          description: "Failed to delete category",
          variant: "destructive",
        })
      }
    },
    [user, categories, toast],
  )

  const getCategoryById = useCallback(
    (id: string) => {
      return categories.find((category) => category.id === id)
    },
    [categories],
  )

  const getCategoryByName = useCallback(
    (name: string) => {
      return categories.find((category) => category.name.toLowerCase() === name.toLowerCase())
    },
    [categories],
  )

  const getDefaultCategories = useCallback(() => {
    return categories.filter((cat) => cat.is_default)
  }, [categories])

  const getCustomCategories = useCallback(() => {
    return categories.filter((cat) => !cat.is_default)
  }, [categories])

  const value: CategoriesContextType = {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoryByName,
    getDefaultCategories,
    getCustomCategories,
    refetch: fetchCategories,
  }

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>
}
