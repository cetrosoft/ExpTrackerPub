<<<<<<< HEAD
import { getDictionary } from "@/lib/dictionaries"
import { BudgetsList } from "@/components/budgets/budgets-list"
import { BudgetsProvider } from "@/contexts/budgets-context"

export default async function BudgetsPage({ params }: { params: { lang: string } }) {
  const dictionary = await getDictionary(params.lang)

  return (
    <BudgetsProvider>
      <BudgetsList dictionary={dictionary} lang={params.lang} />
    </BudgetsProvider>
=======
// Example of setting the page title in a specific page
"use client"

import { useEffect } from "react"
import { usePageTitle } from "@/contexts/page-title-context"
import { BudgetsList } from "@/components/budgets/budgets-list"
import { getDictionary } from "@/lib/dictionaries"

async function getBudgetsPageDictionary(lang: string) {
  return await getDictionary(lang)
}

export default async function BudgetsPage({
  params: { lang },
}: {
  params: { lang: string }
}) {
  const { setTitle } = usePageTitle()
  const dictionary = await getBudgetsPageDictionary(lang)

  useEffect(() => {
    setTitle("Budget Management")
    // Reset title when component unmounts
    return () => setTitle("Dashboard")
  }, [setTitle])

  return (
    <div className="container mx-auto py-6">
      <BudgetsList dictionary={dictionary} lang={lang} />
    </div>
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
  )
}
