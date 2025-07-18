"use client"

import { LoadingSpinner } from "./loading-spinner"

interface PageLoadingProps {
  isLoading: boolean
  message?: string
  variant?: "overlay" | "inline" | "minimal"
  spinnerVariant?: "spinner" | "dots" | "pulse" | "bars" | "ring"
}

export function PageLoading({
  isLoading,
  message = "Loading...",
  variant = "overlay",
  spinnerVariant = "ring",
}: PageLoadingProps) {
  if (!isLoading) return null

  if (variant === "minimal") {
    return (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner variant={spinnerVariant} size="md" />
      </div>
    )
  }

  if (variant === "inline") {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <LoadingSpinner variant={spinnerVariant} size="lg" />
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      </div>
    )
  }

  // Overlay variant (default)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4 p-8 rounded-lg bg-white shadow-lg border">
        <LoadingSpinner variant={spinnerVariant} size="xl" />
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">{message}</p>
          <p className="text-sm text-gray-500 mt-1">Please wait a moment...</p>
        </div>
      </div>
    </div>
  )
}
