"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const colors = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Yellow", value: "#F59E0B" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Gray", value: "#6B7280" },
  { name: "Pink", value: "#EC4899" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Orange", value: "#F97316" },
  { name: "Red", value: "#EF4444" },
  { name: "Emerald", value: "#059669" },
  { name: "Violet", value: "#7C3AED" },
]

interface CategoryColorPickerProps {
  value: string
  onChange: (color: string) => void
  dictionary: any
}

export function CategoryColorPicker({ value, onChange, dictionary }: CategoryColorPickerProps) {
  const [open, setOpen] = useState(false)

  const selectedColor = colors.find((color) => color.value === value) || colors[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: selectedColor.value }} />
            <span>{selectedColor.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <button
              key={color.value}
              type="button"
              className={cn(
                "relative w-12 h-12 rounded-lg border-2 transition-all hover:scale-105",
                value === color.value ? "border-gray-900 ring-2 ring-gray-900 ring-offset-2" : "border-gray-200",
              )}
              style={{ backgroundColor: color.value }}
              onClick={() => {
                onChange(color.value)
                setOpen(false)
              }}
              title={color.name}
            >
              {value === color.value && <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-lg" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
