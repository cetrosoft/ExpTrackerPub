import indexedDBService, { type Expense } from "./indexeddb-service"

export { Expense } from "./indexeddb-service"

class DataService {
  private apiBaseUrl: string
  private isOnlineValue: boolean

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl
    this.isOnlineValue = typeof navigator !== "undefined" ? navigator.onLine : true

    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        this.isOnlineValue = true
        this.syncData()
      })
      window.addEventListener("offline", () => {
        this.isOnlineValue = false
      })
    }
  }

  get isOnline(): boolean {
    return this.isOnlineValue
  }

  // Expense operations
  async getExpenses(): Promise<Expense[]> {
    try {
      if (this.isOnline && this.apiBaseUrl) {
        // Try to fetch from API if online
        try {
          const response = await fetch(`${this.apiBaseUrl}/expenses`)
          if (response.ok) {
            const data = await response.json()
            console.log(`🌐 API returned ${data.length} expenses`)
            // Update local database with server data
            await this.updateLocalExpenses(data)
            return data
          }
        } catch (error) {
          console.warn("Failed to fetch expenses from API, falling back to local data", error)
        }
      }

      // Fallback to local data
      const localData = await indexedDBService.getExpenses()
      console.log(`💾 Local DB returned ${localData.length} expenses`)
      return localData
    } catch (error) {
      console.error("Error getting expenses:", error)
      return []
    }
  }

  async getExpenseById(id: string): Promise<Expense | undefined> {
    try {
      if (this.isOnline && this.apiBaseUrl) {
        // Try to fetch from API if online
        try {
          const response = await fetch(`${this.apiBaseUrl}/expenses/${id}`)
          if (response.ok) {
            const data = await response.json()
            return data
          }
        } catch (error) {
          console.warn(`Failed to fetch expense ${id} from API, falling back to local data`, error)
        }
      }

      // Fallback to local data
      return await indexedDBService.getExpenseById(id)
    } catch (error) {
      console.error(`Error getting expense ${id}:`, error)
      return undefined
    }
  }

  async saveExpense(expense: Omit<Expense, "id" | "synced" | "updatedAt">): Promise<Expense> {
    try {
      if (this.isOnline && this.apiBaseUrl) {
        // Try to save to API if online
        try {
          const response = await fetch(`${this.apiBaseUrl}/expenses`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(expense),
          })

          if (response.ok) {
            const data = await response.json()
            // Save to local database with synced=true
            const localExpense: Expense = {
              ...data,
              synced: true,
              updatedAt: new Date().toISOString(),
            }
            await indexedDBService.saveExpense(localExpense)
            return data
          }
        } catch (error) {
          console.warn("Failed to save expense to API, saving locally", error)
        }
      }

      // Save locally
      return await indexedDBService.saveExpense(expense)
    } catch (error) {
      console.error("Error saving expense:", error)
      throw error
    }
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    try {
      if (this.isOnline && this.apiBaseUrl) {
        // Try to update on API if online
        try {
          const response = await fetch(`${this.apiBaseUrl}/expenses/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
          })

          if (response.ok) {
            const data = await response.json()
            // Update local database with synced=true
            const localExpense = await indexedDBService.getExpenseById(id)
            if (localExpense) {
              await indexedDBService.updateExpense(id, {
                ...data,
                synced: true,
              })
            }
            return data
          }
        } catch (error) {
          console.warn(`Failed to update expense ${id} on API, updating locally`, error)
        }
      }

      // Update locally
      return await indexedDBService.updateExpense(id, updates)
    } catch (error) {
      console.error(`Error updating expense ${id}:`, error)
      throw error
    }
  }

  async deleteExpense(id: string): Promise<void> {
    try {
      if (this.isOnline && this.apiBaseUrl) {
        // Try to delete from API if online
        try {
          const response = await fetch(`${this.apiBaseUrl}/expenses/${id}`, {
            method: "DELETE",
          })

          if (response.ok) {
            // Delete from local database
            await indexedDBService.deleteExpense(id)
            return
          }
        } catch (error) {
          console.warn(`Failed to delete expense ${id} from API, deleting locally`, error)
        }
      }

      // Delete locally
      await indexedDBService.deleteExpense(id)
    } catch (error) {
      console.error(`Error deleting expense ${id}:`, error)
      throw error
    }
  }

  // Sync operations
  async syncData(): Promise<void> {
    if (!this.isOnline || !this.apiBaseUrl) {
      return
    }

    try {
      const syncQueue = await indexedDBService.getSyncQueue()

      for (const item of syncQueue) {
        if (item.entity === "expenses") {
          try {
            switch (item.operation) {
              case "create":
                await this.syncCreateExpense(item.data)
                break
              case "update":
                await this.syncUpdateExpense(item.data)
                break
              case "delete":
                await this.syncDeleteExpense(item.data.id)
                break
            }

            // Remove from sync queue if successful
            await indexedDBService.removeSyncQueueItem(item.id)
          } catch (error) {
            console.error(`Error syncing operation ${item.operation} for ${item.entity}:`, error)
          }
        }
      }
    } catch (error) {
      console.error("Error syncing data:", error)
    }
  }

  private async syncCreateExpense(expense: Expense): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expense),
    })

    if (response.ok) {
      const serverExpense = await response.json()

      // Update local expense with server ID and mark as synced
      await indexedDBService.updateExpense(expense.id, {
        id: serverExpense.id,
        synced: true,
      })
    } else {
      throw new Error(`Failed to sync create expense: ${response.statusText}`)
    }
  }

  private async syncUpdateExpense(expense: Expense): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/expenses/${expense.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expense),
    })

    if (response.ok) {
      // Mark as synced
      await indexedDBService.updateExpense(expense.id, {
        synced: true,
      })
    } else {
      throw new Error(`Failed to sync update expense: ${response.statusText}`)
    }
  }

  private async syncDeleteExpense(id: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/expenses/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Failed to sync delete expense: ${response.statusText}`)
    }
  }

  private async updateLocalExpenses(serverExpenses: Expense[]): Promise<void> {
    const localExpenses = await indexedDBService.getExpenses()
    const localExpensesMap = new Map(localExpenses.map((e) => [e.id, e]))

    // Update or add server expenses to local database
    for (const serverExpense of serverExpenses) {
      const localExpense = localExpensesMap.get(serverExpense.id)

      if (!localExpense) {
        // New expense from server
        await indexedDBService.saveExpense({
          ...serverExpense,
          synced: true,
        })
      } else if (new Date(serverExpense.updatedAt) > new Date(localExpense.updatedAt)) {
        // Server has newer version
        await indexedDBService.updateExpense(serverExpense.id, {
          ...serverExpense,
          synced: true,
        })
      }

      // Remove from map to track what's been processed
      localExpensesMap.delete(serverExpense.id)
    }

    // Handle local expenses not on server
    for (const [id, localExpense] of localExpensesMap.entries()) {
      if (!localExpense.synced) {
        // Local changes not yet synced - keep them
        continue
      }

      // Expense exists locally but not on server - it was deleted on server
      await indexedDBService.deleteExpense(id)
    }
  }

  // Cleanup
  dispose(): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("online", () => {
        this.isOnlineValue = true
        this.syncData()
      })
      window.removeEventListener("offline", () => {
        this.isOnlineValue = false
      })
    }
  }
}

export default DataService
