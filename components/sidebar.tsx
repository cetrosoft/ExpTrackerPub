"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CreditCard,
  BarChart2,
  Tag,
  Settings,
  Building,
  DollarSign,
  TrendingUp,
  FileText,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  dictionary: any
  lang: string
}

export function Sidebar({ dictionary, lang }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === `/${lang}${path}`
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "",
      icon: LayoutDashboard,
    },
    {
      name: "Expenses",
      href: "/expenses",
      icon: CreditCard,
    },
    {
      name: "Budgets",
      href: "/budgets",
      icon: Target,
    },
    {
      name: "Categories",
      href: "/categories",
      icon: BarChart2,
    },
    {
      name: "Tags",
      href: "/tags",
      icon: Tag,
    },
    {
      name: "Suppliers",
      href: "/suppliers",
      icon: Building,
    },
    {
      name: "Currencies",
      href: "/currencies",
      icon: DollarSign,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: TrendingUp,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FileText,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link href={`/${lang}`} className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ET</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">ExpenseTracker</h1>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={`/${lang}${item.href}`}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">© 2025 ExpenseTracker</p>
      </div>
    </div>
  )
}
