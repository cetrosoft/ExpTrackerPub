"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBudgets, type Budget } from "@/contexts/budgets-context"
import { useCategories } from "@/contexts/categories-context"
import { CategoryIcon } from "@/components/categories/category-icon"

const formSchema = z.object({
  name: z.string().min(1, "Budget name is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  category_id: z.string().min(1, "Category is required"),
  period: z.enum(["monthly", "yearly"]),
  alert_threshold: z.number().min(1).max(100).default(80),
  rollover_unused: z.boolean().default(false),
})

type FormData = z.infer<typeof formSchema>

interface BudgetFormProps {
  dictionary: any
  lang: string
  budget?: Budget
  onSuccess?: () => void
  onCancel?: () => void
}

export function BudgetForm({ dictionary, lang, budget, onSuccess, onCancel }: BudgetFormProps) {
  const { addBudget, updateBudget } = useBudgets()
  const { categories } = useCategories()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isRtl = lang === "ar"

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: budget?.name || "",
      amount: budget?.amount || 0,
      category_id: budget?.category_id || "",
      period: budget?.period || "monthly",
      alert_threshold: budget?.alert_threshold || 80,
      rollover_unused: budget?.rollover_unused || false,
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      if (budget) {
        await updateBudget(budget.id, {
          ...data,
          start_date: budget.start_date, // Keep existing start date
        })
      } else {
        // Create new budget with proper structure
        await addBudget({
          ...data,
          start_date: new Date().toISOString().split("T")[0], // Today's date
          end_date: null,
          is_active: true,
        })
      }
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error("Error saving budget:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter budget name" {...field} className={isRtl ? "text-right" : ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                    className={isRtl ? "text-right" : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20`, color: category.color }}
                          >
                            <CategoryIcon name={category.icon} className="w-3 h-3" />
                          </div>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="period"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget Period</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alert_threshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alert Threshold (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="80"
                    {...field}
                    onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 80)}
                    className={isRtl ? "text-right" : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className={cn("flex gap-3", isRtl ? "flex-row-reverse" : "")}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : budget ? "Update Budget" : "Create Budget"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
