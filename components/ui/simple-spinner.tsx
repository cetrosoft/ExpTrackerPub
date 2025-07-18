"use client"

import { cn } from "@/lib/utils"

interface SimpleSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function SimpleSpinner({ size = "md", className }: SimpleSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
        sizeClasses[size],
        className,
      )}
    />
  )
}
