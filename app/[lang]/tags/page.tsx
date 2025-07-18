import { getDictionary } from "@/lib/dictionaries"
import { TagsList } from "@/components/tags/tags-list"

export default async function TagsPage({
  params: { lang },
}: {
  params: { lang: string }
}) {
  const dictionary = await getDictionary(lang)

  return <TagsList dictionary={dictionary} lang={lang} />
}
