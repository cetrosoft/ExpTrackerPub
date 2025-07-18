import express from "express"
import cors from "cors"
import { createDatabaseAdapter } from "./adapters/database-adapter"
import { config } from "./config"

// Create the database adapter based on configuration
const dbAdapter = createDatabaseAdapter(config.database.type, config.database.config)

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Authentication middleware (placeholder)
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Implement your authentication logic here
  // For example, check JWT token
  next()
}

// Expense routes
app.get("/api/expenses", authenticate, async (req, res) => {
  try {
    const expenses = await dbAdapter.getExpenses()
    res.json(expenses)
  } catch (error) {
    console.error("Error fetching expenses:", error)
    res.status(500).json({ error: "Failed to fetch expenses" })
  }
})

app.get("/api/expenses/:id", authenticate, async (req, res) => {
  try {
    const expense = await dbAdapter.getExpenseById(req.params.id)
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" })
    }
    res.json(expense)
  } catch (error) {
    console.error(`Error fetching expense ${req.params.id}:`, error)
    res.status(500).json({ error: "Failed to fetch expense" })
  }
})

app.post("/api/expenses", authenticate, async (req, res) => {
  try {
    const expense = await dbAdapter.createExpense(req.body)
    res.status(201).json(expense)
  } catch (error) {
    console.error("Error creating expense:", error)
    res.status(500).json({ error: "Failed to create expense" })
  }
})

app.put("/api/expenses/:id", authenticate, async (req, res) => {
  try {
    const expense = await dbAdapter.updateExpense(req.params.id, req.body)
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" })
    }
    res.json(expense)
  } catch (error) {
    console.error(`Error updating expense ${req.params.id}:`, error)
    res.status(500).json({ error: "Failed to update expense" })
  }
})

app.delete("/api/expenses/:id", authenticate, async (req, res) => {
  try {
    const success = await dbAdapter.deleteExpense(req.params.id)
    if (!success) {
      return res.status(404).json({ error: "Expense not found" })
    }
    res.status(204).end()
  } catch (error) {
    console.error(`Error deleting expense ${req.params.id}:`, error)
    res.status(500).json({ error: "Failed to delete expense" })
  }
})

// Add routes for other entities here

// Start the server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
