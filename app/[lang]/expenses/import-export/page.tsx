import { getDictionary } from "@/lib/dictionaries"
import { ImportExportExpenses } from "@/components/expenses/import-export"

export default async function ImportExportPage({
  params: { lang },
}: {
  params: { lang: string }
}) {
  const dictionary = await getDictionary(lang)

  return (
    <div className="container mx-auto py-6">
      <ImportExportExpenses dictionary={dictionary} />
    </div>
  )
}
