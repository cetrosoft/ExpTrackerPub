const dictionaries = {
<<<<<<< HEAD
  en: () => import("@/dictionaries/en.json").then((module) => module.default),
  ar: () => import("@/dictionaries/ar.json").then((module) => module.default),
  hi: () => import("@/dictionaries/hi.json").then((module) => module.default),
}

export const getDictionary = async (locale: string) => {
  try {
    return dictionaries[locale as keyof typeof dictionaries]?.() || dictionaries.en()
  } catch (error) {
    // Fallback dictionary if files don't exist
    return {
      dashboard: {
        title: "Dashboard",
        total_expenses: "Total Expenses",
        transactions: "Transactions",
        categories: "Categories",
        avg_transaction: "Avg. per Transaction",
        recent_expenses: "Recent Expenses",
        quick_stats: "Quick Stats",
        this_month: "This Month",
        last_7_days: "Last 7 Days",
        categories_used: "Categories Used",
        no_expenses: "No expenses found",
        start_adding: "Start by adding your first expense",
        expenses_by_category: "Expenses by Category",
        expenses_by_tags: "Expenses by Tags",
      },
      navigation: {
        dashboard: "Dashboard",
        expenses: "Expenses",
        categories: "Categories",
        suppliers: "Suppliers",
        currencies: "Currencies",
        analytics: "Analytics",
        reports: "Reports",
        settings: "Settings",
      },
      expenses: {
        no_expenses: "No expenses found",
      },
      months: {
        january: "January",
        february: "February",
        march: "March",
        april: "April",
        may: "May",
        june: "June",
        july: "July",
        august: "August",
        september: "September",
        october: "October",
        november: "November",
        december: "December",
      },
      categories: {
        food: "Food",
        transport: "Transport",
        entertainment: "Entertainment",
        utilities: "Utilities",
        healthcare: "Healthcare",
        shopping: "Shopping",
        education: "Education",
        travel: "Travel",
      },
    }
  }
=======
  en: () => import("../dictionaries/en.json").then((module) => module.default),
  ar: () => import("../dictionaries/ar.json").then((module) => module.default),
  hi: () => import("../dictionaries/hi.json").then((module) => module.default),
}

export const getDictionary = async (locale: string) => {
  const dict = dictionaries[locale as keyof typeof dictionaries]
  return dict ? await dict() : await dictionaries.en()
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
}
