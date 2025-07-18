import { getDictionary } from "@/lib/dictionaries"
import { ExpenseList } from "@/components/expenses/expense-list"
import { Button } from "@/components/ui/button"
import { FileUp, FileDown } from "lucide-react"
import Link from "next/link"

export default async function ExpensesPage({
  params: { lang },
}: {
  params: { lang: string }
}) {
  const dictionary = await getDictionary(lang)

  return (
    <div>
      {/* Add import/export buttons in the top-right corner */}
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/${lang}/expenses/import-export?action=import`}>
            <FileUp className="mr-2 h-4 w-4" />
            Import
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/${lang}/expenses/import-export?action=export`}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Link>
        </Button>
      </div>

      {/* Original content */}
      <ExpenseList dictionary={dictionary} lang={lang} />
    </div>
  )
}
