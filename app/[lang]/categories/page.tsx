import { getDictionary } from "@/lib/dictionaries"
import { CategoriesList } from "@/components/categories/categories-list"

export default async function CategoriesPage({
  params: { lang },
}: {
  params: { lang: string }
}) {
  const dictionary = await getDictionary(lang)

  return <CategoriesList dictionary={dictionary} lang={lang} />
}
