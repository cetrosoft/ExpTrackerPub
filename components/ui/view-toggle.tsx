"use client"

import type React from "react"

import { LayoutGrid, List, Grid } from "lucide-react"

interface ViewToggleProps {
  value: string
  onChange: (value: string) => void
  options?: Array<{
    value: string
    icon: React.ReactNode
    label: string
  }>
}

export function ViewToggle({ value, onChange, options }: ViewToggleProps) {
  const defaultOptions = [
    {
      value: "cards",
      icon: <LayoutGrid size={18} />,
      label: "Cards view",
    },
    {
      value: "list",
      icon: <List size={18} />,
      label: "List view",
    },
    {
      value: "grid",
      icon: <Grid size={18} />,
      label: "Grid view",
    },
  ]

  const viewOptions = options || defaultOptions

  return (
    <div className="flex items-center border rounded-md overflow-hidden">
      {viewOptions.map((option) => (
        <button
          key={option.value}
          className={`p-2 transition-colors ${
            value === option.value ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
          }`}
          onClick={() => onChange(option.value)}
          aria-label={option.label}
        >
          {option.icon}
        </button>
      ))}
    </div>
  )
}
