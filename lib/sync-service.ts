import indexedDBService from "./indexeddb-service"

export class SyncService {
  private apiBaseUrl: string
  private isOnline: boolean = navigator.onLine

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl

    // Listen for online/offline events
    window.addEventListener("online", () => {
      this.isOnline = true
      this.syncPendingChanges()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
    })
  }

  async syncPendingChanges(): Promise<void> {
    if (!this.isOnline) return

    try {
      const syncQueue = await indexedDBService.getSyncQueue()

      if (syncQueue.length === 0) return

      // Group operations by entity type for batch processing
      const operationsByEntity = syncQueue.reduce(
        (acc, item) => {
          if (!acc[item.entity]) acc[item.entity] = []
          acc[item.entity].push({
            localId: item.id,
            type: item.operation,
            data: item.data,
            timestamp: item.timestamp,
          })
          return acc
        },
        {} as Record<string, any[]>,
      )

      // Sync each entity type
      for (const [entity, operations] of Object.entries(operationsByEntity)) {
        await this.syncEntityOperations(entity, operations)
      }

      console.log("✅ All pending changes synced successfully")
    } catch (error) {
      console.error("❌ Sync failed:", error)
    }
  }

  private async syncEntityOperations(entity: string, operations: any[]): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entity,
          operations,
        }),
      })

      if (!response.ok) {
        throw new Error(`Sync failed for ${entity}: ${response.statusText}`)
      }

      const { results } = await response.json()

      // Process results and update local database
      for (const result of results) {
        if (result.success) {
          // Remove from sync queue
          await indexedDBService.removeSyncQueueItem(result.localId)

          // Update local record with server data if needed
          if (result.result && entity === "expenses") {
            await this.updateLocalExpenseWithServerData(result.result)
          }
        } else {
          console.error(`Failed to sync operation ${result.localId}:`, result.error)
        }
      }

      console.log(`✅ Synced ${entity}: ${results.filter((r) => r.success).length}/${results.length} operations`)
    } catch (error) {
      console.error(`❌ Failed to sync ${entity}:`, error)
      throw error
    }
  }

  private async updateLocalExpenseWithServerData(serverExpense: any): Promise<void> {
    try {
      // Update the local expense with server ID and mark as synced
      const localExpense = await indexedDBService.getExpenseById(serverExpense.id)

      if (localExpense) {
        await indexedDBService.updateExpense(serverExpense.id, {
          ...serverExpense,
          synced: true,
        })
      }
    } catch (error) {
      console.error("Failed to update local expense with server data:", error)
    }
  }

  // Force sync - useful for manual sync buttons
  async forcSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error("Cannot sync while offline")
    }

    await this.syncPendingChanges()
  }

  // Get sync status
  async getSyncStatus(): Promise<{
    pendingOperations: number
    lastSyncTime: string | null
    isOnline: boolean
  }> {
    const syncQueue = await indexedDBService.getSyncQueue()

    return {
      pendingOperations: syncQueue.length,
      lastSyncTime: localStorage.getItem("lastSyncTime"),
      isOnline: this.isOnline,
    }
  }
}
