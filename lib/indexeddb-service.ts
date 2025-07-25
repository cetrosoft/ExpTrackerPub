// IndexedDB service for offline storage

export interface Expense {
  id: string
  title: string
  amount: number
  category: string
  tags: string[]
  date: string
  description?: string
  currency: string
  synced: boolean
  createdAt: string
  updatedAt: string
}

export interface SyncQueueItem {
  id: string
  operation: "create" | "update" | "delete"
  entity: "expenses"
  data: any
  timestamp: number
}

class IndexedDBService {
  private dbName = "expense-tracker-db"
  private version = 1
  private db: IDBDatabase | null = null

  constructor() {
    this.initDB()
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = (event) => {
        console.error("Error opening IndexedDB:", event)
        reject(new Error("Could not open IndexedDB"))
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create expenses store
        if (!db.objectStoreNames.contains("expenses")) {
          const expensesStore = db.createObjectStore("expenses", { keyPath: "id" })
          expensesStore.createIndex("date", "date", { unique: false })
          expensesStore.createIndex("category", "category", { unique: false })
          expensesStore.createIndex("synced", "synced", { unique: false })
        }

        // Create sync queue store
        if (!db.objectStoreNames.contains("syncQueue")) {
          const syncQueueStore = db.createObjectStore("syncQueue", { keyPath: "id" })
          syncQueueStore.createIndex("timestamp", "timestamp", { unique: false })
          syncQueueStore.createIndex("entity", "entity", { unique: false })
        }
      }
    })
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB()
    }
    return this.db!
  }

  // Expense operations
  async getExpenses(): Promise<Expense[]> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("expenses", "readonly")
      const store = transaction.objectStore("expenses")
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = (event) => {
        reject(new Error("Error fetching expenses"))
      }
    })
  }

  async getExpenseById(id: string): Promise<Expense | undefined> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("expenses", "readonly")
      const store = transaction.objectStore("expenses")
      const request = store.get(id)

      request.onsuccess = () => {
        resolve(request.result || undefined)
      }

      request.onerror = () => {
        reject(new Error(`Error fetching expense with id ${id}`))
      }
    })
  }

  async saveExpense(expense: Omit<Expense, "id" | "synced" | "createdAt" | "updatedAt">): Promise<Expense> {
    const now = new Date().toISOString()
    const newExpense: Expense = {
      ...expense,
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      synced: false,
      createdAt: now,
      updatedAt: now,
    }

    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("expenses", "readwrite")
      const store = transaction.objectStore("expenses")
      const request = store.add(newExpense)

      request.onsuccess = () => {
        // Add to sync queue
        this.addToSyncQueue({
          id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          operation: "create",
          entity: "expenses",
          data: newExpense,
          timestamp: Date.now(),
        })
        resolve(newExpense)
      }

      request.onerror = () => {
        reject(new Error("Error saving expense"))
      }
    })
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    const db = await this.ensureDB()
    const expense = await this.getExpenseById(id)

    if (!expense) {
      throw new Error(`Expense with id ${id} not found`)
    }

    const updatedExpense: Expense = {
      ...expense,
      ...updates,
      synced: false,
      updatedAt: new Date().toISOString(),
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction("expenses", "readwrite")
      const store = transaction.objectStore("expenses")
      const request = store.put(updatedExpense)

      request.onsuccess = () => {
        // Add to sync queue
        this.addToSyncQueue({
          id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          operation: "update",
          entity: "expenses",
          data: updatedExpense,
          timestamp: Date.now(),
        })
        resolve(updatedExpense)
      }

      request.onerror = () => {
        reject(new Error(`Error updating expense with id ${id}`))
      }
    })
  }

  async deleteExpense(id: string): Promise<void> {
    const db = await this.ensureDB()
    const expense = await this.getExpenseById(id)

    if (!expense) {
      throw new Error(`Expense with id ${id} not found`)
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction("expenses", "readwrite")
      const store = transaction.objectStore("expenses")
      const request = store.delete(id)

      request.onsuccess = () => {
        // Add to sync queue
        this.addToSyncQueue({
          id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          operation: "delete",
          entity: "expenses",
          data: { id },
          timestamp: Date.now(),
        })
        resolve()
      }

      request.onerror = () => {
        reject(new Error(`Error deleting expense with id ${id}`))
      }
    })
  }

  // Sync queue operations
  private async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("syncQueue", "readwrite")
      const store = transaction.objectStore("syncQueue")
      const request = store.add(item)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error("Error adding item to sync queue"))
      }
    })
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("syncQueue", "readonly")
      const store = transaction.objectStore("syncQueue")
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(new Error("Error fetching sync queue"))
      }
    })
  }

  async removeSyncQueueItem(id: string): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("syncQueue", "readwrite")
      const store = transaction.objectStore("syncQueue")
      const request = store.delete(id)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error(`Error removing sync queue item with id ${id}`))
      }
    })
  }

  // Clear all data (for testing)
  async clearAllData(): Promise<void> {
    const db = await this.ensureDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["expenses", "syncQueue"], "readwrite")
      const expensesStore = transaction.objectStore("expenses")
      const syncQueueStore = transaction.objectStore("syncQueue")

      expensesStore.clear()
      syncQueueStore.clear()

      transaction.oncomplete = () => {
        resolve()
      }

      transaction.onerror = () => {
        reject(new Error("Error clearing all data"))
      }
    })
  }
}

// Create a singleton instance
const indexedDBService = new IndexedDBService()
export default indexedDBService
