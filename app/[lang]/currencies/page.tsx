import { getDictionary } from "@/lib/dictionaries"
import { CurrenciesList } from "@/components/currencies/currencies-list"

export default async function CurrenciesPage({
  params: { lang },
}: {
  params: { lang: string }
}) {
  const dictionary = await getDictionary(lang)

  return <CurrenciesList dictionary={dictionary} lang={lang} />
}
