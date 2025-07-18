import { type NextRequest, NextResponse } from "next/server"
//import { createDatabaseAdapter } from "@/lib/database/database-adapter"
import { createDatabaseAdapter } from '@/server/api/adapters/database-adapter';

import { config } from "@/lib/config"

// This endpoint handles syncing local changes to the server
export async function POST(request: NextRequest) {
  try {
    const { operations } = await request.json()

    if (!Array.isArray(operations)) {
      return NextResponse.json({ error: "Invalid operations format" }, { status: 400 })
    }

    const dbAdapter = createDatabaseAdapter(config.database.type, config.database)
    const results = []

    for (const operation of operations) {
      try {
        let result = null

        switch (operation.entity) {
          case "expenses":
            result = await handleExpenseOperation(dbAdapter, operation)
            break
          case "categories":
            result = await handleCategoryOperation(dbAdapter, operation)
            break
          // Add other entities as needed
        }

        results.push({
          localId: operation.localId,
          success: true,
          result,
        })
      } catch (error) {
        results.push({
          localId: operation.localId,
          success: false,
          error: error.message,
        })
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}

async function handleExpenseOperation(dbAdapter: any, operation: any) {
  const { type, data } = operation

  switch (type) {
    case "create":
      return await dbAdapter.createExpense(data)
    case "update":
      return await dbAdapter.updateExpense(data.id, data)
    case "delete":
      return await dbAdapter.deleteExpense(data.id)
    default:
      throw new Error(`Unknown operation type: ${type}`)
  }
}

async function handleCategoryOperation(dbAdapter: any, operation: any) {
  const { type, data } = operation

  switch (type) {
    case "create":
      return await dbAdapter.createCategory(data)
    case "update":
      return await dbAdapter.updateCategory(data.id, data)
    case "delete":
      return await dbAdapter.deleteCategory(data.id)
    default:
      throw new Error(`Unknown operation type: ${type}`)
  }
}
