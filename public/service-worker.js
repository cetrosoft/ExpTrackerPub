// Service Worker for offline support
const CACHE_NAME = "expense-tracker-v1"
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/static/js/main.js",
  "/static/css/main.css",
  // Add other static assets here
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== CACHE_NAME
          })
          .map((name) => {
            return caches.delete(name)
          }),
      )
    }),
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
    return
  }

  // API requests - network first, then cache
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response before using it
          const responseToCache = response.clone()

          // Cache the successful response
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }

          return response
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request)
        }),
    )
    return
  }

  // Static assets - cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return from cache if found
      if (response) {
        return response
      }

      // Otherwise fetch from network
      return fetch(event.request).then((response) => {
        // Clone the response before using it
        const responseToCache = response.clone()

        // Cache the successful response
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }

        return response
      })
    }),
  )
})

// Background sync for pending operations
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-expenses") {
    event.waitUntil(syncExpenses())
  }
})

// Function to sync pending operations
async function syncExpenses() {
  try {
    // Open IndexedDB
    const db = await openDB()

    // Get pending operations from sync queue
    const tx = db.transaction("syncQueue", "readonly")
    const store = tx.objectStore("syncQueue")
    const pendingOps = await store.getAll()

    // Process each operation
    for (const op of pendingOps) {
      try {
        await processOperation(op)

        // Remove from queue if successful
        const deleteTx = db.transaction("syncQueue", "readwrite")
        await deleteTx.objectStore("syncQueue").delete(op.id)
      } catch (error) {
        console.error("Error processing operation:", error)
      }
    }
  } catch (error) {
    console.error("Error in background sync:", error)
  }
}

// Helper function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("expense-tracker-db", 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Helper function to process an operation
async function processOperation(op) {
  const { operation, entity, data } = op

  if (entity === "expenses") {
    const apiUrl = "/api/expenses"

    switch (operation) {
      case "create":
        await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        break

      case "update":
        await fetch(`${apiUrl}/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        break

      case "delete":
        await fetch(`${apiUrl}/${data.id}`, {
          method: "DELETE",
        })
        break
    }
  }
}
