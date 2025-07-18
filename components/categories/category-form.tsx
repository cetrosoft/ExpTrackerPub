"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useCategories, type Category } from "@/contexts/categories-context"
import { CategoryColorPicker } from "@/components/categories/category-color-picker"
import { CategoryIconPicker } from "@/components/categories/category-icon-picker"

const formSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  color: z.string().min(1, "Color is required"),
  icon: z.string().min(1, "Icon is required"),
})

type FormData = z.infer<typeof formSchema>

interface CategoryFormProps {
  dictionary: any
  lang: string
  category?: Category
  onSuccess?: () => void
  onCancel?: () => void
}

export function CategoryForm({ dictionary, lang, category, onSuccess, onCancel }: CategoryFormProps) {
  const { addCategory, updateCategory } = useCategories()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isRtl = lang === "ar"

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      color: category?.color || "#3B82F6",
      icon: category?.icon || "MoreHorizontal",
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      if (category) {
<<<<<<< HEAD
        await updateCategory(category.id, data)
      } else {
        // Create new category with proper structure
        await addCategory({
          ...data,
          is_default: false,
          user_id: undefined, // Will be set by the context
        })
      }
      form.reset()
=======
        updateCategory(category.id, data)
      } else {
        addCategory({ ...data, isDefault: false })
      }
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
      onSuccess?.()
    } catch (error) {
      console.error("Error saving category:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">
          {category ? dictionary.categories_management.edit_category : dictionary.categories_management.add_category}
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.categories_management.category_name}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={dictionary.categories_management.category_name}
                    {...field}
                    className={isRtl ? "text-right" : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.categories_management.category_color}</FormLabel>
                <FormControl>
                  <CategoryColorPicker value={field.value} onChange={field.onChange} dictionary={dictionary} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dictionary.categories_management.category_icon}</FormLabel>
                <FormControl>
                  <CategoryIconPicker value={field.value} onChange={field.onChange} dictionary={dictionary} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className={cn("flex gap-3", isRtl ? "flex-row-reverse" : "")}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "..." : dictionary.form.save}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                {dictionary.form.cancel}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
