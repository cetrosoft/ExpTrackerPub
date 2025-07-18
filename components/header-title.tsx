"use client"

import { usePathname } from "next/navigation"

export function HeaderTitle({ dictionary }: { dictionary: any }) {
  const pathname = usePathname()

  // Extract the page name from the URL path
  const getPageTitle = () => {
    // Remove language prefix and split by /
    const path = pathname.split("/").filter(Boolean)

    // If path has segments after language, use the first one
    if (path.length > 1) {
      const pageName = path[1]

      // Try to get title from dictionary
      const dictionaryTitle = dictionary?.[pageName]?.title

      if (dictionaryTitle) return dictionaryTitle

      // Capitalize first letter
      return pageName.charAt(0).toUpperCase() + pageName.slice(1)
    }

    // Default to Dashboard for home page
    return dictionary?.dashboard?.title || "Dashboard"
  }

  return <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
}
