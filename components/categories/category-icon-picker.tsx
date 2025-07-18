"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CategoryIcon } from "@/components/categories/category-icon"

const icons = [
  // Original icons
  { name: "Car", value: "Car" },
  { name: "Heart", value: "Heart" },
  { name: "Utensils", value: "UtensilsCrossed" },
  { name: "Gamepad", value: "Gamepad2" },
  { name: "Zap", value: "Zap" },
  { name: "Shopping Bag", value: "ShoppingBag" },
  { name: "Graduation Cap", value: "GraduationCap" },
  { name: "Plane", value: "Plane" },
  { name: "Home", value: "Home" },
  { name: "Coffee", value: "Coffee" },
  { name: "Music", value: "Music" },
  { name: "Camera", value: "Camera" },
  { name: "Book", value: "Book" },
  { name: "Dumbbell", value: "Dumbbell" },
  { name: "Gift", value: "Gift" },
  { name: "Smartphone", value: "Smartphone" },
  { name: "Laptop", value: "Laptop" },
  { name: "Shirt", value: "Shirt" },
  { name: "Fuel", value: "Fuel" },
  { name: "Stethoscope", value: "Stethoscope" },

  // New icons
  { name: "Baby", value: "Baby" },
  { name: "Bus", value: "Bus" },
  { name: "Train", value: "Train" },
  { name: "Bicycle", value: "Bicycle" },
  { name: "Briefcase", value: "Briefcase" },
  { name: "Building", value: "Building" },
  { name: "Calendar", value: "Calendar" },
  { name: "Credit Card", value: "CreditCard" },
  { name: "Dollar Sign", value: "DollarSign" },
  { name: "Film", value: "Film" },
  { name: "Flame", value: "Flame" },
  { name: "Flower", value: "Flower" },
  { name: "Globe", value: "Globe" },
  { name: "Hammer", value: "Hammer" },
  { name: "Headphones", value: "Headphones" },
  { name: "Pizza", value: "Pizza" },
  { name: "Pill", value: "Pill" },
  { name: "Scissors", value: "Scissors" },
  { name: "Shopping Cart", value: "ShoppingCart" },
  { name: "TV", value: "Tv" },
  { name: "Wallet", value: "Wallet" },
  { name: "Wine", value: "Wine" },

  { name: "More", value: "MoreHorizontal" },
]

interface CategoryIconPickerProps {
  value: string
  onChange: (icon: string) => void
  dictionary: any
}

export function CategoryIconPicker({ value, onChange, dictionary }: CategoryIconPickerProps) {
  const [open, setOpen] = useState(false)

  const selectedIcon = icons.find((icon) => icon.value === value) || icons[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <CategoryIcon name={selectedIcon.value} className="w-4 h-4" />
            <span>{selectedIcon.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3">
        <div className="grid grid-cols-6 gap-2">
          {icons.map((icon) => (
            <button
              key={icon.value}
              type="button"
              className={cn(
                "relative w-12 h-12 rounded-lg border-2 transition-all hover:scale-105 flex items-center justify-center",
                value === icon.value ? "border-gray-900 bg-gray-100" : "border-gray-200 hover:border-gray-300",
              )}
              onClick={() => {
                onChange(icon.value)
                setOpen(false)
              }}
              title={icon.name}
            >
              <CategoryIcon name={icon.value} className="w-5 h-5" />
              {value === icon.value && (
                <Check className="absolute -top-1 -right-1 h-4 w-4 text-green-600 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
