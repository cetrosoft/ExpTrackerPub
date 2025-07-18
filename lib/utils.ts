import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

<<<<<<< HEAD
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
=======
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
}
