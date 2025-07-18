export function filterExpensesByPeriod(expenses: any[], month: number, year: number) {
  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() + 1 === month && expenseDate.getFullYear() === year
  })
}

export function filterExpensesByYear(expenses: any[], year: number) {
  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getFullYear() === year
  })
}

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string, currencies: any[]) {
  if (fromCurrency === toCurrency) return amount

  const fromRate = currencies.find((c) => c.code === fromCurrency)?.exchangeRate || 1
  const toRate = currencies.find((c) => c.code === toCurrency)?.exchangeRate || 1

  // Convert to base currency first, then to target currency
  const baseAmount = amount / fromRate
  return baseAmount * toRate
}

export function getMonthName(month: number, dictionary: any) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  return months[month - 1] || "Unknown"
}
