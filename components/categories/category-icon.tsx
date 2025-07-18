"use client"

import type React from "react"

import {
  Car,
  Heart,
  UtensilsCrossed,
  Gamepad2,
  Zap,
  ShoppingBag,
  GraduationCap,
  Plane,
  Home,
  Coffee,
  Music,
  Camera,
  Book,
  Dumbbell,
  Gift,
  Smartphone,
  Laptop,
  Shirt,
  Fuel,
  Stethoscope,
  MoreHorizontal,
  Baby,
  Bus,
  Train,
  Bike,
  Briefcase,
  Building,
  Calendar,
  CreditCard,
  DollarSign,
  Film,
  Flame,
  Flower,
  Globe,
  Hammer,
  Headphones,
  Pizza,
  Pill,
  Scissors,
  ShoppingCart,
  Tv,
  Wallet,
  Wine,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<any>> = {
  // Original icons
  Car: Car,
  Heart: Heart,
  UtensilsCrossed: UtensilsCrossed,
  Gamepad2: Gamepad2,
  Zap: Zap,
  ShoppingBag: ShoppingBag,
  GraduationCap: GraduationCap,
  Plane: Plane,
  Home: Home,
  Coffee: Coffee,
  Music: Music,
  Camera: Camera,
  Book: Book,
  Dumbbell: Dumbbell,
  Gift: Gift,
  Smartphone: Smartphone,
  Laptop: Laptop,
  Shirt: Shirt,
  Fuel: Fuel,
  Stethoscope: Stethoscope,
  MoreHorizontal: MoreHorizontal,

  // New icons
  Baby: Baby,
  Bus: Bus,
  Train: Train,
  Bicycle: Bike,
  Briefcase: Briefcase,
  Building: Building,
  Calendar: Calendar,
  CreditCard: CreditCard,
  DollarSign: DollarSign,
  Film: Film,
  Flame: Flame,
  Flower: Flower,
  Globe: Globe,
  Hammer: Hammer,
  Headphones: Headphones,
  Pizza: Pizza,
  Pill: Pill,
  Scissors: Scissors,
  ShoppingCart: ShoppingCart,
  Tv: Tv,
  Wallet: Wallet,
  Wine: Wine,
}

interface CategoryIconProps {
  name: string
  className?: string
  style?: React.CSSProperties
}

export function CategoryIcon({ name, className, style }: CategoryIconProps) {
  // Debug log to see what icon name is being requested
  console.log("Requesting icon:", name)

  // Try to find the icon, fallback to MoreHorizontal if not found
  const IconComponent = iconMap[name] || MoreHorizontal

  // Debug log to see what component we're getting
  console.log("Icon component found:", IconComponent.name || "Unknown")

  return <IconComponent className={className} style={style} />
}
