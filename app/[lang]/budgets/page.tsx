import { getDictionary } from "@/lib/dictionaries"
import { BudgetsList } from "@/components/budgets/budgets-list"
import { BudgetsProvider } from "@/contexts/budgets-context"

export default async function BudgetsPage({ params }: { params: { lang: string } }) {
  const dictionary = await getDictionary(params.lang)

  return (
    <BudgetsProvider>
      <BudgetsList dictionary={dictionary} lang={params.lang} />
    </BudgetsProvider>
  )
}
