"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { SyncService } from "@/lib/sync-service"
import { useAuth } from "@/contexts/auth-context"

export function useSyncService() {
  const { user } = useAuth()
  const syncServiceRef = useRef<SyncService | null>(null)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      if (!syncServiceRef.current) {
        syncServiceRef.current = new SyncService(user.id)
      } else {
        syncServiceRef.current.setUserId(user.id)
      }
      // Optionally load last sync time on mount if available in IndexedDB
      // This would require a method in SyncService to get it without triggering a full sync
    } else {
      syncServiceRef.current = null
      setSyncStatus("idle")
      setLastSyncTime(null)
    }
  }, [user])

  const syncData = useCallback(async () => {
    if (!syncServiceRef.current || !user) {
      setSyncStatus("error")
      return
    }

    setLoading(true)
    setSyncStatus("syncing")
    try {
      const result = await syncServiceRef.current.syncAllData()
      if (result.success) {
        setSyncStatus("success")
        setLastSyncTime(new Date()) // Update to current time on successful sync
      } else {
        setSyncStatus("error")
        console.error("Sync failed:", result.message)
      }
    } catch (error) {
      setSyncStatus("error")
      console.error("Error during sync:", error)
    } finally {
      setLoading(false)
      // Reset status after a short delay to show feedback
      setTimeout(() => setSyncStatus("idle"), 3000)
    }
  }, [user])

  return { syncData, lastSyncTime, syncStatus, loading }
}
