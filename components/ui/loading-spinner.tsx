"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "spinner" | "dots" | "pulse" | "bars" | "ring"
  className?: string
}

export function LoadingSpinner({ size = "md", variant = "spinner", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  }

  if (variant === "spinner") {
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

  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", className)}>
        <div
          className={cn("rounded-full bg-blue-600 animate-bounce", sizeClasses[size])}
          style={{ animationDelay: "0ms" }}
        />
        <div
          className={cn("rounded-full bg-blue-600 animate-bounce", sizeClasses[size])}
          style={{ animationDelay: "150ms" }}
        />
        <div
          className={cn("rounded-full bg-blue-600 animate-bounce", sizeClasses[size])}
          style={{ animationDelay: "300ms" }}
        />
      </div>
    )
  }

  if (variant === "pulse") {
    return <div className={cn("rounded-full bg-blue-600 animate-pulse", sizeClasses[size], className)} />
  }

  if (variant === "bars") {
    return (
      <div className={cn("flex space-x-1", className)}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-1 bg-blue-600 animate-pulse"
            style={{
              height: size === "sm" ? "16px" : size === "md" ? "24px" : size === "lg" ? "32px" : "48px",
              animationDelay: `${i * 100}ms`,
              animationDuration: "1s",
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === "ring") {
    return (
      <div className={cn("relative", sizeClasses[size], className)}>
        <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
        <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  return null
}
