"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { SyncService } from "@/lib/sync-service"
import { config } from "@/lib/config"

export function SyncStatus() {
  const [syncService] = useState(() => new SyncService(config.api.baseUrl))
  const [syncStatus, setSyncStatus] = useState({
    pendingOperations: 0,
    lastSyncTime: null as string | null,
    isOnline: navigator.onLine,
  })
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const updateStatus = async () => {
      const status = await syncService.getSyncStatus()
      setSyncStatus(status)
    }

    updateStatus()
    const interval = setInterval(updateStatus, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [syncService])

  const handleManualSync = async () => {
    if (!syncStatus.isOnline) return

    setIsSyncing(true)
    try {
      await syncService.forcSync()
      const newStatus = await syncService.getSyncStatus()
      setSyncStatus(newStatus)
      localStorage.setItem("lastSyncTime", new Date().toISOString())
    } catch (error) {
      console.error("Manual sync failed:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return "Never"

    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
      {/* Online/Offline Status */}
      <div className="flex items-center gap-1">
        {syncStatus.isOnline ? (
          <Wifi className="h-4 w-4 text-green-600" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-600" />
        )}
        <span className="text-sm font-medium">{syncStatus.isOnline ? "Online" : "Offline"}</span>
      </div>

      {/* Pending Operations */}
      {syncStatus.pendingOperations > 0 && (
        <Badge variant="outline" className="text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          {syncStatus.pendingOperations} pending
        </Badge>
      )}

      {/* Sync Status */}
      {syncStatus.pendingOperations === 0 && syncStatus.isOnline && (
        <Badge variant="outline" className="text-xs text-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Synced
        </Badge>
      )}

      {/* Last Sync Time */}
      <span className="text-xs text-muted-foreground">Last sync: {formatLastSync(syncStatus.lastSyncTime)}</span>

      {/* Manual Sync Button */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleManualSync}
        disabled={!syncStatus.isOnline || isSyncing}
        className="h-6 px-2"
      >
        <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
      </Button>
    </div>
  )
}
