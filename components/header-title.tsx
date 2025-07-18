"use client"

import { usePageTitle } from "@/contexts/page-title-context"

export function HeaderTitle() {
  const { title } = usePageTitle()
  return <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
}
