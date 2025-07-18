import { Pool } from "pg"
import type { DatabaseAdapter } from "./database-adapter"
import type { Expense, Category } from "@/types"

export class PostgresAdapter implements DatabaseAdapter {
  private pool: Pool

  constructor(config: any) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    })
  }

  // Expense operations
  async getExpenses(userId?: string): Promise<Expense[]> {
    const query = userId
      ? "SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC"
      : "SELECT * FROM expenses ORDER BY date DESC"

    const params = userId ? [userId] : []
    const result = await this.pool.query(query, params)

    return result.rows.map(this.mapExpenseFromDb)
  }

  async getExpenseById(id: string, userId?: string): Promise<Expense | null> {
    const query = userId
      ? "SELECT * FROM expenses WHERE id = $1 AND user_id = $2"
      : "SELECT * FROM expenses WHERE id = $1"

    const params = userId ? [id, userId] : [id]
    const result = await this.pool.query(query, params)

    return result.rows[0] ? this.mapExpenseFromDb(result.rows[0]) : null
  }

  async createExpense(expense: Omit<Expense, "id" | "createdAt" | "updatedAt">, userId?: string): Promise<Expense> {
    const id = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const now = new Date()

    const query = `
      INSERT INTO expenses (id, title, amount, category_id, currency_code, date, description, tags, supplier_id, user_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `

    const values = [
      id,
      expense.title,
      expense.amount,
      expense.category,
      expense.currency,
      expense.date,
      expense.description || null,
      JSON.stringify(expense.tags || []),
      null, // supplier_id for future use
      userId || null,
      now,
      now,
    ]

    const result = await this.pool.query(query, values)
    return this.mapExpenseFromDb(result.rows[0])
  }

  async updateExpense(id: string, updates: Partial<Expense>, userId?: string): Promise<Expense | null> {
    const setClause = []
    const values = []
    let paramIndex = 1

    if (updates.title !== undefined) {
      setClause.push(`title = $${paramIndex++}`)
      values.push(updates.title)
    }
    if (updates.amount !== undefined) {
      setClause.push(`amount = $${paramIndex++}`)
      values.push(updates.amount)
    }
    if (updates.category !== undefined) {
      setClause.push(`category_id = $${paramIndex++}`)
      values.push(updates.category)
    }
    if (updates.currency !== undefined) {
      setClause.push(`currency_code = $${paramIndex++}`)
      values.push(updates.currency)
    }
    if (updates.date !== undefined) {
      setClause.push(`date = $${paramIndex++}`)
      values.push(updates.date)
    }
    if (updates.description !== undefined) {
      setClause.push(`description = $${paramIndex++}`)
      values.push(updates.description)
    }
    if (updates.tags !== undefined) {
      setClause.push(`tags = $${paramIndex++}`)
      values.push(JSON.stringify(updates.tags))
    }

    setClause.push(`updated_at = $${paramIndex++}`)
    values.push(new Date())

    values.push(id)
    if (userId) values.push(userId)

    const whereClause = userId
      ? "WHERE id = $" + paramIndex + " AND user_id = $" + (paramIndex + 1)
      : "WHERE id = $" + paramIndex

    const query = `
      UPDATE expenses 
      SET ${setClause.join(", ")}
      ${whereClause}
      RETURNING *
    `

    const result = await this.pool.query(query, values)
    return result.rows[0] ? this.mapExpenseFromDb(result.rows[0]) : null
  }

  async deleteExpense(id: string, userId?: string): Promise<boolean> {
    const query = userId ? "DELETE FROM expenses WHERE id = $1 AND user_id = $2" : "DELETE FROM expenses WHERE id = $1"

    const params = userId ? [id, userId] : [id]
    const result = await this.pool.query(query, params)

    return result.rowCount > 0
  }

  // Category operations
  async getCategories(userId?: string): Promise<Category[]> {
    const query = userId
      ? "SELECT * FROM categories WHERE user_id = $1 OR is_default = TRUE ORDER BY is_default DESC, name ASC"
      : "SELECT * FROM categories ORDER BY is_default DESC, name ASC"

    const params = userId ? [userId] : []
    const result = await this.pool.query(query, params)

    return result.rows.map(this.mapCategoryFromDb)
  }

  async createCategory(category: Omit<Category, "id" | "createdAt" | "updatedAt">, userId?: string): Promise<Category> {
    const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const now = new Date()

    const query = `
      INSERT INTO categories (id, name, color, icon, is_default, user_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `

    const values = [
      id,
      category.name,
      category.color,
      category.icon,
      category.isDefault || false,
      userId || null,
      now,
      now,
    ]

    const result = await this.pool.query(query, values)
    return this.mapCategoryFromDb(result.rows[0])
  }

  // Helper methods
  private mapExpenseFromDb(row: any): Expense {
    return {
      id: row.id,
      title: row.title,
      amount: Number.parseFloat(row.amount),
      category: row.category_id,
      currency: row.currency_code,
      date: row.date,
      description: row.description,
      tags: Array.isArray(row.tags) ? row.tags : JSON.parse(row.tags || "[]"),
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    }
  }

  private mapCategoryFromDb(row: any): Category {
    return {
      id: row.id,
      name: row.name,
      color: row.color,
      icon: row.icon,
      isDefault: row.is_default,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    }
  }

  async close(): Promise<void> {
    await this.pool.end()
  }
}
