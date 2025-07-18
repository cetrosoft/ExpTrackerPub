// Define the interface for database operations
export interface DatabaseAdapter {
  // Expense operations
  getExpenses(): Promise<any[]>
  getExpenseById(id: string): Promise<any | null>
  createExpense(expense: any): Promise<any>
  updateExpense(id: string, expense: any): Promise<any>
  deleteExpense(id: string): Promise<boolean>

  // Add other entity operations as needed
}

// Factory function to create the appropriate adapter
export function createDatabaseAdapter(type: string, config: any): DatabaseAdapter {
  switch (type.toLowerCase()) {
    case "postgres":
      return new PostgresAdapter(config)
    case "mysql":
      return new MySQLAdapter(config)
    case "mongodb":
      return new MongoDBAdapter(config)
    default:
      throw new Error(`Unsupported database type: ${type}`)
  }
}

// PostgreSQL implementation
class PostgresAdapter implements DatabaseAdapter {
  private client: any

  constructor(config: any) {
    // Initialize PostgreSQL client
    this.client = require("pg").Pool(config)
  }

  async getExpenses(): Promise<any[]> {
    const result = await this.client.query("SELECT * FROM expenses ORDER BY date DESC")
    return result.rows
  }

  async getExpenseById(id: string): Promise<any | null> {
    const result = await this.client.query("SELECT * FROM expenses WHERE id = $1", [id])
    return result.rows[0] || null
  }

  async createExpense(expense: any): Promise<any> {
    const { id, title, amount, category, date, description, tags } = expense
    const result = await this.client.query(
      "INSERT INTO expenses (id, title, amount, category, date, description, tags, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [id, title, amount, category, date, description, JSON.stringify(tags || []), new Date()],
    )
    return result.rows[0]
  }

  async updateExpense(id: string, expense: any): Promise<any> {
    const { title, amount, category, date, description, tags } = expense
    const result = await this.client.query(
      "UPDATE expenses SET title = $1, amount = $2, category = $3, date = $4, description = $5, tags = $6, updated_at = $7 WHERE id = $8 RETURNING *",
      [title, amount, category, date, description, JSON.stringify(tags || []), new Date(), id],
    )
    return result.rows[0]
  }

  async deleteExpense(id: string): Promise<boolean> {
    const result = await this.client.query("DELETE FROM expenses WHERE id = $1", [id])
    return result.rowCount > 0
  }
}

// MySQL implementation
class MySQLAdapter implements DatabaseAdapter {
  private connection: any

  constructor(config: any) {
    // Initialize MySQL connection
    this.connection = require("mysql2/promise").createPool(config)
  }

  async getExpenses(): Promise<any[]> {
    const [rows] = await this.connection.execute("SELECT * FROM expenses ORDER BY date DESC")
    return rows
  }

  async getExpenseById(id: string): Promise<any | null> {
    const [rows] = await this.connection.execute("SELECT * FROM expenses WHERE id = ?", [id])
    return rows[0] || null
  }

  async createExpense(expense: any): Promise<any> {
    const { id, title, amount, category, date, description, tags } = expense
    const [result] = await this.connection.execute(
      "INSERT INTO expenses (id, title, amount, category, date, description, tags, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, title, amount, category, date, description, JSON.stringify(tags || []), new Date()],
    )

    return { id, ...expense }
  }

  async updateExpense(id: string, expense: any): Promise<any> {
    const { title, amount, category, date, description, tags } = expense
    await this.connection.execute(
      "UPDATE expenses SET title = ?, amount = ?, category = ?, date = ?, description = ?, tags = ?, updated_at = ? WHERE id = ?",
      [title, amount, category, date, description, JSON.stringify(tags || []), new Date(), id],
    )

    return { id, ...expense }
  }

  async deleteExpense(id: string): Promise<boolean> {
    const [result] = await this.connection.execute("DELETE FROM expenses WHERE id = ?", [id])
    return result.affectedRows > 0
  }
}

// MongoDB implementation
class MongoDBAdapter implements DatabaseAdapter {
  private db: any

  constructor(config: any) {
    // Initialize MongoDB connection
    const { MongoClient } = require("mongodb")
    const client = new MongoClient(config.uri)
    this.db = client.db(config.dbName)
  }

  async getExpenses(): Promise<any[]> {
    return await this.db.collection("expenses").find().sort({ date: -1 }).toArray()
  }

  async getExpenseById(id: string): Promise<any | null> {
    return await this.db.collection("expenses").findOne({ id })
  }

  async createExpense(expense: any): Promise<any> {
    const result = await this.db.collection("expenses").insertOne({
      ...expense,
      updatedAt: new Date(),
    })
    return expense
  }

  async updateExpense(id: string, expense: any): Promise<any> {
    await this.db.collection("expenses").updateOne(
      { id },
      {
        $set: {
          ...expense,
          updatedAt: new Date(),
        },
      },
    )
    return { id, ...expense }
  }

  async deleteExpense(id: string): Promise<boolean> {
    const result = await this.db.collection("expenses").deleteOne({ id })
    return result.deletedCount > 0
  }
}
