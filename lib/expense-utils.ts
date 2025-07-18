export function filterExpensesByPeriod(expenses: any[], month: number, year: number) {
<<<<<<< HEAD
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
=======
  const filtered = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    const expenseMonth = expenseDate.getMonth() + 1
    const expenseYear = expenseDate.getFullYear()
    return expenseMonth === month && expenseYear === year
  })

  console.log(`🔍 filterExpensesByPeriod: ${month}/${year} - Found ${filtered.length} expenses`)
  return filtered
}

export function filterExpensesByYear(expenses: any[], year: number) {
  const filtered = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    const expenseYear = expenseDate.getFullYear()
    return expenseYear === year
  })

  console.log(`🔍 filterExpensesByYear: ${year} - Found ${filtered.length} expenses`)
  return filtered
}

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string, currencies: any[]) {
  if (fromCurrency === toCurrency) {
    console.log(`💱 No conversion needed: ${amount} ${fromCurrency}`)
    return amount
  }

  const fromRate = currencies.find((c) => c.code === fromCurrency)?.exchange_rate || 1
  const toRate = currencies.find((c) => c.code === toCurrency)?.exchange_rate || 1

  // Convert to base currency first, then to target currency
  const baseAmount = amount / Number(fromRate)
  const convertedAmount = baseAmount * Number(toRate)

  console.log(
    `💱 Currency conversion: ${amount} ${fromCurrency} (rate: ${fromRate}) → ${convertedAmount} ${toCurrency} (rate: ${toRate})`,
  )

  return convertedAmount
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
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
