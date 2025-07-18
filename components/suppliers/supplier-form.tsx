"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useSuppliers, type Supplier } from "@/contexts/suppliers-context"

const formSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
<<<<<<< HEAD
  contact_person: z.string().optional(), // Changed to snake_case
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
=======
  contactPerson: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
})

type FormData = z.infer<typeof formSchema>

interface SupplierFormProps {
  dictionary: any
  lang: string
  supplier?: Supplier
  onSuccess?: () => void
  onCancel?: () => void
}

export function SupplierForm({ dictionary, lang, supplier, onSuccess, onCancel }: SupplierFormProps) {
  const { addSupplier, updateSupplier } = useSuppliers()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isRtl = lang === "ar"

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: supplier?.name || "",
      email: supplier?.email || "",
      phone: supplier?.phone || "",
      address: supplier?.address || "",
<<<<<<< HEAD
      contact_person: supplier?.contact_person || "", // Changed to snake_case
      notes: supplier?.notes || "",
      is_active: supplier?.is_active ?? true,
=======
      contactPerson: supplier?.contactPerson || "",
      notes: supplier?.notes || "",
      isActive: supplier?.isActive ?? true,
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      if (supplier) {
<<<<<<< HEAD
        await updateSupplier(supplier.id, data)
      } else {
        await addSupplier(data)
=======
        updateSupplier(supplier.id, data)
      } else {
        addSupplier(data)
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
      }
      onSuccess?.()
    } catch (error) {
      console.error("Error saving supplier:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter supplier name" {...field} className={isRtl ? "text-right" : ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
<<<<<<< HEAD
              name="contact_person" // Changed to snake_case
=======
              name="contactPerson"
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact person name" {...field} className={isRtl ? "text-right" : ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter email address"
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} className={isRtl ? "text-right" : ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter supplier address"
                      className={cn("resize-none", isRtl && "text-right")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter additional notes"
                      className={cn("resize-none", isRtl && "text-right")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
<<<<<<< HEAD
            name="is_active"
=======
            name="isActive"
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <div className="text-sm text-muted-foreground">Enable this supplier for transactions</div>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className={cn("flex gap-3", isRtl ? "flex-row-reverse" : "")}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "..." : "Save"}
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
