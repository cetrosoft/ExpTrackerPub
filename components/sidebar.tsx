"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
<<<<<<< HEAD
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
=======
  Home,
  Receipt,
  Tag,
  Store,
  CreditCard,
  Settings,
  Menu,
  X,
  PieChart,
  FileBarChart,
  Target,
  Package,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d

interface SidebarProps {
  dictionary: any
  lang: string
}

export function Sidebar({ dictionary, lang }: SidebarProps) {
  const pathname = usePathname()
<<<<<<< HEAD

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
=======
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isRtl = lang === "ar"

  const routes = [
    {
      name: dictionary.sidebar?.dashboard || "Dashboard",
      href: `/${lang}`,
      icon: Home,
    },
    {
      name: dictionary.sidebar?.expenses || "Expenses",
      href: `/${lang}/expenses`,
      icon: Receipt,
    },
    {
      name: dictionary.sidebar?.budgets || "Budgets",
      href: `/${lang}/budgets`,
      icon: Target,
    },
    {
      name: dictionary.sidebar?.categories || "Categories",
      href: `/${lang}/categories`,
      icon: Package,
    },
    {
      name: dictionary.sidebar?.tags || "Tags",
      href: `/${lang}/tags`,
      icon: Tag,
    },
    {
      name: dictionary.sidebar?.suppliers || "Suppliers",
      href: `/${lang}/suppliers`,
      icon: Store,
    },
    {
      name: dictionary.sidebar?.currencies || "Currencies",
      href: `/${lang}/currencies`,
      icon: CreditCard,
    },
    {
      name: dictionary.sidebar?.analytics || "Analytics",
      href: `/${lang}/analytics`,
      icon: PieChart,
    },
    {
      name: dictionary.sidebar?.reports || "Reports",
      href: `/${lang}/reports`,
      icon: FileBarChart,
    },
    {
      name: dictionary.sidebar?.settings || "Settings",
      href: `/${lang}/settings`,
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
      icon: Settings,
    },
  ]

<<<<<<< HEAD
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
=======
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar for mobile and desktop */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          isRtl && "left-auto right-0",
          isRtl && isMobileMenuOpen ? "translate-x-0" : isRtl && "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold">Expense Tracker</h1>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {routes.map((route) => {
              const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`)
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    isRtl && "flex-row-reverse text-right",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  <route.icon className="h-5 w-5" />
                  <span>{route.name}</span>
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t">
            <div className="text-xs text-muted-foreground">
              <p>© 2023 Expense Tracker</p>
              <p>v1.0.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
  )
}
