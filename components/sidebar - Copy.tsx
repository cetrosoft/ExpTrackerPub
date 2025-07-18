"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Receipt,
  Tags,
  Building2,
  DollarSign,
  Settings,
  PieChart,
  TrendingUp,
  Wallet,
} from "lucide-react"

interface SidebarProps {
  dictionary: any
  lang: string
}

export function Sidebar({ dictionary, lang }: SidebarProps) {
  const pathname = usePathname()
  const isRtl = lang === "ar"

  const navigation = [
    {
      name: dictionary.navigation?.dashboard || "Dashboard",
      href: `/${lang}`,
      icon: LayoutDashboard,
      current: pathname === `/${lang}`,
    },
    {
      name: dictionary.navigation?.expenses || "Expenses",
      href: `/${lang}/expenses`,
      icon: Receipt,
      current: pathname.startsWith(`/${lang}/expenses`),
    },
    {
      name: dictionary.navigation?.categories || "Categories",
      href: `/${lang}/categories`,
      icon: Tags,
      current: pathname.startsWith(`/${lang}/categories`),
    },
    {
      name: dictionary.navigation?.suppliers || "Suppliers",
      href: `/${lang}/suppliers`,
      icon: Building2,
      current: pathname.startsWith(`/${lang}/suppliers`),
    },
    {
      name: dictionary.navigation?.currencies || "Currencies",
      href: `/${lang}/currencies`,
      icon: DollarSign,
      current: pathname.startsWith(`/${lang}/currencies`),
    },
    {
      name: dictionary.navigation?.analytics || "Analytics",
      href: `/${lang}/analytics`,
      icon: PieChart,
      current: pathname.startsWith(`/${lang}/analytics`),
    },
    {
      name: dictionary.navigation?.reports || "Reports",
      href: `/${lang}/reports`,
      icon: TrendingUp,
      current: pathname.startsWith(`/${lang}/reports`),
    },
    {
      name: dictionary.navigation?.settings || "Settings",
      href: `/${lang}/settings`,
      icon: Settings,
      current: pathname.startsWith(`/${lang}/settings`),
    },
  ]

  return (
    <div className={cn("flex h-full w-64 flex-col bg-white border-r", isRtl && "border-l border-r-0")}>
      <div className="flex h-16 items-center px-6 border-b">
        <div className="flex items-center gap-2">
          <Wallet className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">ExpenseTracker</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                item.current
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                isRtl && "flex-row-reverse",
              )}
            >
              <Icon
                className={cn(
                  "flex-shrink-0 h-5 w-5",
                  item.current ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500",
                  isRtl ? "ml-3" : "mr-3",
                )}
              />
              <span className="flex-1">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
