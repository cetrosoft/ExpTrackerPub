import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "USD", locale = "en-US") {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  })

  return formatter.format(amount)
}

export function formatCurrencyForArabic(amount: number, currency = "EGP") {
  // For Arabic, we want to show numbers in Western Arabic numerals
  // but maintain RTL layout for the currency symbol
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  })

  return formatter.format(amount)
}

export function formatNumber(number: number, locale = "en-US") {
  return new Intl.NumberFormat(locale).format(number)
}

export function formatDate(date: Date | string, locale = "en-US", options?: Intl.DateTimeFormatOptions) {
  const dateObj = typeof date === "string" ? new Date(date) : date

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }

  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj)
}
