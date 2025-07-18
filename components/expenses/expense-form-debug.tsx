"use client"

import { useExpenses } from "../../contexts/expenses-context"
import { useCategories } from "../../contexts/categories-context"
import { useTags } from "../../contexts/tags-context"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MultiSelect } from "@/components/ui/multi-select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  category_id: z.string().min(1, "Category is required"),
  currency_code: z.string().default("EGP"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

type FormData = z.infer<typeof formSchema>

interface ExpenseFormProps {
  expense?: any // The expense to edit
  onSuccess?: () => void
  onCancel?: () => void
}

export function ExpenseForm({ expense, onSuccess, onCancel }: ExpenseFormProps) {
  const { addExpense, updateExpense } = useExpenses()
  const { categories, loading: categoriesLoading } = useCategories()
  const { tags, loading: tagsLoading } = useTags()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!expense

  // Debug logging
  console.log("ExpenseForm render - expense:", expense)
  console.log("ExpenseForm render - categories:", categories)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: 0,
      category_id: "",
      currency_code: "EGP",
      date: new Date().toISOString().split("T")[0],
      description: "",
      tags: [],
    },
  })

  // Set form values when editing an expense
  useEffect(() => {
    if (expense) {
      console.log("Setting form values for editing:", expense)

      // First, ensure categories are loaded
      if (categories.length > 0) {
        // Check if the expense's category_id exists in the categories
        const categoryExists = categories.some((cat) => cat.id === expense.category_id)
        console.log("Category exists in categories:", categoryExists)

        const formValues = {
          title: expense.title || "",
          amount: expense.amount || 0,
          category_id: categoryExists ? expense.category_id : categories[0]?.id || "",
          currency_code: expense.currency_code || "EGP",
          date: expense.date
            ? new Date(expense.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          description: expense.description || "",
          tags: Array.isArray(expense.tags) ? expense.tags : [],
        }

        console.log("Setting form values:", formValues)
        form.reset(formValues)
      }
    }
  }, [expense, form, categories])

  const onSubmit = async (data: FormData) => {
    console.log("Form submitted with data:", data)
    setIsSubmitting(true)

    try {
      if (isEditing) {
        await updateExpense(expense.id, {
          title: data.title,
          amount: Number(data.amount),
          category_id: data.category_id,
          currency_code: data.currency_code,
          date: data.date,
          description: data.description || "",
          tags: data.tags || [],
        })
      } else {
        await addExpense({
          title: data.title,
          amount: Number(data.amount),
          category_id: data.category_id,
          currency_code: data.currency_code,
          date: data.date,
          description: data.description || "",
          tags: data.tags || [],
          supplier_id: undefined,
        })
      }

      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error("Error saving expense:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const tagOptions = tags.map((tag) => ({
    value: tag.id,
    label: tag.name,
    color: tag.color,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{isEditing ? "Edit Expense" : "Add Expense"}</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter expense title" {...field} />
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
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => {
              console.log("Category field value:", field.value)
              console.log("Available categories:", categories)
              return (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading categories...
                        </SelectItem>
                      ) : categories.length === 0 ? (
                        <SelectItem value="no-categories" disabled>
                          No categories available
                        </SelectItem>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )
            }}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (Optional)</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={tagOptions}
                    selected={field.value || []}
                    onValueChange={field.onChange}
                    placeholder="Select tags"
                    variant="inverted"
                    animation={2}
                    maxCount={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || categoriesLoading || tagsLoading}>
              {isSubmitting ? "Saving..." : isEditing ? "Update Expense" : "Save Expense"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
