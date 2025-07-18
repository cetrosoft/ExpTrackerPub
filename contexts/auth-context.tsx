"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
<<<<<<< HEAD
import { supabase } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
=======
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase-client"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

<<<<<<< HEAD
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
=======
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
<<<<<<< HEAD
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
=======
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d

    // Listen for auth changes
    const {
      data: { subscription },
<<<<<<< HEAD
    } = supabase.auth.onAuthStateChange((_event, session) => {
=======
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)
      setSession(session)
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

<<<<<<< HEAD
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
=======
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
}
