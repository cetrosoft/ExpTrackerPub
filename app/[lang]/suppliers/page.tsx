import { getDictionary } from "@/lib/dictionaries"
import { SuppliersList } from "@/components/suppliers/suppliers-list"

export default async function SuppliersPage({
  params: { lang },
}: {
  params: { lang: string }
}) {
  const dictionary = await getDictionary(lang)

  return <SuppliersList dictionary={dictionary} lang={lang} />
}
