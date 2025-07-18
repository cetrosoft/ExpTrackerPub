"use client"

import { AuthForm } from "@/components/auth/auth-form"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface LoginPageProps {
  params: { lang: string }
}

export default function LoginPage({ params }: LoginPageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (user && !loading) {
      router.push(`/${params.lang}`) // Redirect to dashboard with correct language
    }
  }, [user, loading, router, params.lang])

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // If user is authenticated, don't show login form
  if (user) {
    return null
  }

  return <AuthForm />
}
