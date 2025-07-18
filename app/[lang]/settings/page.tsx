import { getDictionary } from "@/lib/dictionaries"
import { SettingsPage } from "@/components/settings/settings-page"

export default async function Settings({
  params: { lang },
}: {
  params: { lang: string }
}) {
  const dictionary = await getDictionary(lang)

  return <SettingsPage dictionary={dictionary} lang={lang} />
}
