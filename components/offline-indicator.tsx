"use client"

import { useData } from "../contexts/data-context"
import { WifiOff } from "lucide-react"

export function OfflineIndicator() {
  const { isOnline } = useData()

  if (isOnline) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-amber-100 text-amber-800 px-4 py-2 rounded-md shadow-md flex items-center gap-2">
      <WifiOff size={16} />
      <span>You're offline. Changes will sync when you reconnect.</span>
    </div>
  )
}
