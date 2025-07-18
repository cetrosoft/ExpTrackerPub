"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface Option {
  value: string
  label: string
  color?: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onValueChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  variant?: "default" | "inverted"
  animation?: number
  maxCount?: number
  defaultValue?: string[]
}

export function MultiSelect({
  options,
  selected = [],
  onValueChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  emptyText = "No items found.",
  className,
  variant = "default",
  animation = 0,
  maxCount = 999,
  defaultValue,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue || selected || [])

  React.useEffect(() => {
    if (defaultValue) {
      setSelectedValues(defaultValue)
    }
  }, [defaultValue])

  React.useEffect(() => {
    if (selected && Array.isArray(selected)) {
      setSelectedValues(selected)
    }
  }, [selected])

  const handleSelect = (value: string) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value]

    setSelectedValues(newSelectedValues)
    onValueChange(newSelectedValues)
  }

  const handleRemove = (value: string) => {
    const newSelectedValues = selectedValues.filter((item) => item !== value)
    setSelectedValues(newSelectedValues)
    onValueChange(newSelectedValues)
  }

  const selectedOptions = options.filter((option) => selectedValues.includes(option.value))

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-10 h-auto"
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {selectedOptions.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                selectedOptions.slice(0, maxCount).map((option) => (
                  <Badge
                    key={option.value}
                    variant={variant === "inverted" ? "outline" : "secondary"}
                    className="mr-1 mb-1"
                    style={
                      option.color
                        ? {
                            backgroundColor: variant === "inverted" ? `${option.color}20` : undefined,
                            color: variant === "inverted" ? option.color : undefined,
                            borderColor: variant === "inverted" ? option.color : undefined,
                          }
                        : {}
                    }
                  >
                    {option.label}
                    <button
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRemove(option.value)
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={() => handleRemove(option.value)}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                ))
              )}
              {selectedOptions.length > maxCount && (
                <Badge variant="secondary" className="mr-1 mb-1">
                  +{selectedOptions.length - maxCount} more
                </Badge>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className={cn(
                      animation ? `transition-all duration-${animation}00 ease-in-out` : "",
                      selectedValues.includes(option.value) ? "bg-accent" : "",
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValues.includes(option.value) ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="flex items-center gap-2">
                      {option.color && (
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: option.color }} />
                      )}
                      {option.label}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
