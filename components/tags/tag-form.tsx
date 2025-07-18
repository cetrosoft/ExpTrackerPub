"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useTags, type Tag } from "@/contexts/tags-context"
import { CategoryColorPicker } from "@/components/categories/category-color-picker"

const formSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  color: z.string().min(1, "Color is required"),
  description: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface TagFormProps {
  dictionary: any
  lang: string
  tag?: Tag
  onSuccess?: () => void
  onCancel?: () => void
}

export function TagForm({ dictionary, lang, tag, onSuccess, onCancel }: TagFormProps) {
  const { addTag, updateTag } = useTags()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isRtl = lang === "ar"

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tag?.name || "",
      color: tag?.color || "#3B82F6",
      description: tag?.description || "",
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      if (tag) {
        updateTag(tag.id, data)
      } else {
        addTag(data)
      }
      onSuccess?.()
    } catch (error) {
      console.error("Error saving tag:", error)
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
                <FormLabel>{dictionary.tags_management.tag_name}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={dictionary.tags_management.tag_name}
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
                <FormLabel>{dictionary.tags_management.tag_color}</FormLabel>
                <FormControl>
                  <CategoryColorPicker value={field.value} onChange={field.onChange} dictionary={dictionary} />
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
                <FormLabel>{dictionary.tags_management.tag_description}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={dictionary.tags_management.tag_description}
                    className={cn("resize-none", isRtl && "text-right")}
                    {...field}
                  />
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
