"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useCurrencies, type Currency } from "@/contexts/currencies-context"

const formSchema = z.object({
  code: z
    .string()
    .min(3, "Currency code must be at least 3 characters")
    .max(3, "Currency code must be exactly 3 characters"),
  name: z.string().min(1, "Currency name is required"),
  symbol: z.string().min(1, "Currency symbol is required"),
  exchangeRate: z.number().min(0.0001, "Exchange rate must be greater than 0"),
  isActive: z.boolean().default(true),
})

type FormData = z.infer<typeof formSchema>

interface CurrencyFormProps {
  dictionary: any
  lang: string
  currency?: Currency
  onSuccess?: () => void
  onCancel?: () => void
}

export function CurrencyForm({ dictionary, lang, currency, onSuccess, onCancel }: CurrencyFormProps) {
  const { addCurrency, updateCurrency } = useCurrencies()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isRtl = lang === "ar"

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: currency?.code || "",
      name: currency?.name || "",
      symbol: currency?.symbol || "",
      exchangeRate: currency?.exchangeRate || 1.0,
      isActive: currency?.isActive ?? true,
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const currencyData = {
        ...data,
        code: data.code.toUpperCase(),
        isDefault: false, // New currencies are never default by default
      }

      if (currency) {
        updateCurrency(currency.id, currencyData)
      } else {
        addCurrency(currencyData)
      }
      onSuccess?.()
    } catch (error) {
      console.error("Error saving currency:", error)
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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="USD"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      maxLength={3}
                      className={isRtl ? "text-right" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency Symbol</FormLabel>
                  <FormControl>
                    <Input placeholder="$" {...field} className={isRtl ? "text-right" : ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency Name</FormLabel>
                  <FormControl>
                    <Input placeholder="US Dollar" {...field} className={isRtl ? "text-right" : ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="exchangeRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exchange Rate (vs USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      placeholder="1.0000"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                      className={isRtl ? "text-right" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <div className="text-sm text-muted-foreground">Enable this currency for transactions</div>
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
