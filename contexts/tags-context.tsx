"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"

export interface Tag {
  id: string
  name: string
  color: string
  description?: string
  created_at?: string
  updated_at?: string
}

interface TagsContextType {
  tags: Tag[]
  isLoading: boolean
  addTag: (tag: Omit<Tag, "id" | "created_at" | "updated_at">) => Promise<void>
  updateTag: (id: string, tag: Partial<Tag>) => Promise<void>
  deleteTag: (id: string) => Promise<void>
  getTagById: (id: string) => Tag | undefined
  getTagByName: (name: string) => Tag | undefined
}

const TagsContext = createContext<TagsContextType | undefined>(undefined)

export function useTags() {
  const context = useContext(TagsContext)
  if (!context) {
    throw new Error("useTags must be used within a TagsProvider")
  }
  return context
}

export function TagsProvider({ children }: { children: React.ReactNode }) {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { supabase } = useSupabase()
  const { user } = useAuth()

  // Fetch tags from Supabase
  useEffect(() => {
    async function fetchTags() {
      if (!user) {
        setTags([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        console.log("Fetching tags for user:", user.id)

        const { data, error } = await supabase
          .from("tags")
          .select("*")
          .eq("user_id", user.id)
          .order("name", { ascending: true })

        if (error) {
          console.error("Error fetching tags:", error)
          toast({
            title: "Error",
            description: "Failed to load tags",
            variant: "destructive",
          })
          return
        }

        console.log("Fetched tags:", data)
        setTags(data || [])
      } catch (error) {
        console.error("Error in fetchTags:", error)
        toast({
          title: "Error",
          description: "Failed to load tags",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTags()
  }, [supabase, user, toast])

  const addTag = useCallback(
    async (tagData: Omit<Tag, "id" | "created_at" | "updated_at">) => {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be signed in to add tags",
          variant: "destructive",
        })
        return
      }

      try {
        // Check if tag name already exists
        const existingTag = tags.find((tag) => tag.name.toLowerCase() === tagData.name.toLowerCase())

        if (existingTag) {
          toast({
            title: "Error",
            description: "A tag with this name already exists",
            variant: "destructive",
          })
          return
        }

        const newTag = {
          ...tagData,
          user_id: user.id,
        }

        console.log("Adding tag:", newTag)
        const { data, error } = await supabase.from("tags").insert(newTag).select().single()

        if (error) {
          console.error("Error adding tag:", error)
          toast({
            title: "Error",
            description: `Failed to add tag: ${error.message}`,
            variant: "destructive",
          })
          return
        }

        console.log("Tag added:", data)
        setTags((prev) => [...prev, data])
        toast({
          title: "Success",
          description: "Tag added successfully",
        })
      } catch (error) {
        console.error("Error in addTag:", error)
        toast({
          title: "Error",
          description: "Failed to add tag",
          variant: "destructive",
        })
      }
    },
    [tags, toast, supabase, user],
  )

  const updateTag = useCallback(
    async (id: string, tagData: Partial<Tag>) => {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be signed in to update tags",
          variant: "destructive",
        })
        return
      }

      try {
        // Check if new name conflicts with existing tags
        if (tagData.name) {
          const existingTag = tags.find((tag) => tag.id !== id && tag.name.toLowerCase() === tagData.name.toLowerCase())

          if (existingTag) {
            toast({
              title: "Error",
              description: "A tag with this name already exists",
              variant: "destructive",
            })
            return
          }
        }

        const updates = {
          ...tagData,
          updated_at: new Date().toISOString(),
        }

        console.log("Updating tag:", id, updates)
        const { data, error } = await supabase.from("tags").update(updates).eq("id", id).select().single()

        if (error) {
          console.error("Error updating tag:", error)
          toast({
            title: "Error",
            description: `Failed to update tag: ${error.message}`,
            variant: "destructive",
          })
          return
        }

        console.log("Tag updated:", data)
        setTags((prev) => prev.map((tag) => (tag.id === id ? { ...tag, ...data } : tag)))
        toast({
          title: "Success",
          description: "Tag updated successfully",
        })
      } catch (error) {
        console.error("Error in updateTag:", error)
        toast({
          title: "Error",
          description: "Failed to update tag",
          variant: "destructive",
        })
      }
    },
    [tags, toast, supabase, user],
  )

  const deleteTag = useCallback(
    async (id: string) => {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be signed in to delete tags",
          variant: "destructive",
        })
        return
      }

      try {
        console.log("Deleting tag:", id)
        const { error } = await supabase.from("tags").delete().eq("id", id)

        if (error) {
          console.error("Error deleting tag:", error)
          toast({
            title: "Error",
            description: `Failed to delete tag: ${error.message}`,
            variant: "destructive",
          })
          return
        }

        setTags((prev) => prev.filter((tag) => tag.id !== id))
        toast({
          title: "Success",
          description: "Tag deleted successfully",
        })
      } catch (error) {
        console.error("Error in deleteTag:", error)
        toast({
          title: "Error",
          description: "Failed to delete tag",
          variant: "destructive",
        })
      }
    },
    [toast, supabase, user],
  )

  const getTagById = useCallback(
    (id: string) => {
      return tags.find((tag) => tag.id === id)
    },
    [tags],
  )

  const getTagByName = useCallback(
    (name: string) => {
      return tags.find((tag) => tag.name.toLowerCase() === name.toLowerCase())
    },
    [tags],
  )

  const value: TagsContextType = {
    tags,
    isLoading,
    addTag,
    updateTag,
    deleteTag,
    getTagById,
    getTagByName,
  }

  return <TagsContext.Provider value={value}>{children}</TagsContext.Provider>
}
