"use client"

import type React from "react"
<<<<<<< HEAD
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  phone?: string
  bio?: string
  location?: string
  website?: string
  preferred_language: string
  preferred_currency: string
=======
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"

interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  currency_preference: string
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
  timezone: string
  created_at: string
  updated_at: string
}

interface ProfileContextType {
<<<<<<< HEAD
  profile: UserProfile | null
  loading: boolean
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  uploadAvatar: (file: File) => Promise<string>
  refreshProfile: () => Promise<void>
=======
  profile: Profile | null
  loading: boolean
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  uploadAvatar: (file: File) => Promise<string>
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
<<<<<<< HEAD
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

      if (error) {
        // If profile doesn't exist, create it
        if (error.code === "PGRST116") {
          const newProfile = {
            id: user.id,
            email: user.email || "",
            full_name: user.user_metadata?.full_name || "",
            preferred_language: "en",
            preferred_currency: "USD",
            timezone: "UTC",
          }

          const { data: createdProfile, error: createError } = await supabase
            .from("user_profiles")
            .insert(newProfile)
            .select()
            .single()

          if (createError) throw createError
          setProfile(createdProfile)
        } else {
          throw error
        }
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
      throw error
    }
  }

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error("No user logged in")

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      })
      throw error
    }
  }

  const refreshProfile = async () => {
    setLoading(true)
    await fetchProfile()
  }

  useEffect(() => {
    fetchProfile()
  }, [user])

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        updateProfile,
        uploadAvatar,
        refreshProfile,
      }}
    >
=======
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      // Initialize profile with user data
      setProfile({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
        currency_preference: "USD",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        created_at: user.created_at,
        updated_at: new Date().toISOString(),
      })
    } else {
      setProfile(null)
    }
    setLoading(false)
  }, [user])

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return

    const updatedProfile = {
      ...profile,
      ...updates,
      updated_at: new Date().toISOString(),
    }

    setProfile(updatedProfile)
  }

  const uploadAvatar = async (file: File): Promise<string> => {
    // Mock implementation - in real app, upload to Supabase Storage
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        resolve(dataUrl)
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <ProfileContext.Provider value={{ profile, loading, updateProfile, uploadAvatar }}>
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}
