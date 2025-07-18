"use client"

import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/contexts/profile-context"
import { useRouter, usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { User, Settings, LogOut, Globe, UserCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function UserMenu() {
  const pathname = usePathname()
  const lang = pathname.split("/")[1] || "en"
  const { user, signOut } = useAuth()
  const { profile } = useProfile()
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Success",
        description: "You have been signed out successfully",
      })
      // Redirect to login page with current language
      router.push(`/${lang}/login`)
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLanguageChange = (newLang: string) => {
    const currentPath = pathname
    // Remove the current language prefix and add the new one
    const pathWithoutLang = currentPath.replace(/^\/[a-z]{2}/, "")
    const newPath = `/${newLang}${pathWithoutLang}`
    router.push(newPath)
  }

  // Debug: Log the user state
  console.log("UserMenu - User:", user)
  console.log("UserMenu - Profile:", profile)

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <User className="h-4 w-4" />
        <span>Not logged in</span>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || ""} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.full_name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push(`/${lang}/profile`)}>
          <UserCircle className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push(`/${lang}/settings`)}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground">Language</DropdownMenuLabel>

        <DropdownMenuItem onClick={() => handleLanguageChange("en")}>
          <Globe className="mr-2 h-4 w-4" />
          <span>English</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleLanguageChange("ar")}>
          <Globe className="mr-2 h-4 w-4" />
          <span>العربية</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleLanguageChange("hi")}>
          <Globe className="mr-2 h-4 w-4" />
          <span>हिन्दी</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
