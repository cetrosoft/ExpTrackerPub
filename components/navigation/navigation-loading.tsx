"use client"

import { useLinkStatus } from "next/link"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"

interface NavigationLoadingProps {
  className?: string
  variant?: "spinner" | "dots" | "pulse" | "bars" | "ring"
  size?: "sm" | "md" | "lg"
}

export function NavigationLoading({ className, variant = "dots", size = "sm" }: NavigationLoadingProps) {
  const { pending } = useLinkStatus()

  if (!pending) return null

  return (
    <div className={cn("flex items-center", className)}>
      <LoadingSpinner variant={variant} size={size} />
    </div>
  )
}
