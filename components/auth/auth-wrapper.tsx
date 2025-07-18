"use client"

import type React from "react"
<<<<<<< HEAD
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"
=======

import { useAuth } from "@/contexts/auth-context"
import { Auth } from "@/components/auth"
import { Loader2 } from "lucide-react"
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
<<<<<<< HEAD
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Extract language from pathname safely
  const pathSegments = pathname.split("/").filter(Boolean)
  const lang = pathSegments[0] || "en"

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)

      // If no user and we're not already on login page, redirect
      if (!session?.user && !pathname.includes("/login") && pathname !== "/") {
        router.push(`/${lang}/login`)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      // Handle logout - redirect to login
      if (!session?.user && _event === "SIGNED_OUT") {
        router.push(`/${lang}/login`)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, pathname, lang])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
=======
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

<<<<<<< HEAD
  // If no user and not on login page, redirect
  if (!user && !pathname.includes("/login") && pathname !== "/") {
    router.push(`/${lang}/login`)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  // Only return children when authenticated or on login page
=======
  if (!user) {
    return <Auth />
  }

>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
  return <>{children}</>
}
