// This file defines the interface for database adapters
// You'll implement specific adapters when you're ready to connect to a database

export interface DatabaseAdapter {
  // Expense operations
  getExpenses(): Promise<any[]>
  getExpenseById(id: string): Promise<any | null>
  createExpense(expense: any): Promise<any>
  updateExpense(id: string, expense: any): Promise<any>
  deleteExpense(id: string): Promise<boolean>
}

// This is a placeholder adapter that doesn't actually connect to a database
// It's here to ensure the app compiles without errors
export class MemoryAdapter implements DatabaseAdapter {
  private expenses: any[] = []

  async getExpenses(): Promise<any[]> {
    return this.expenses
  }

  async getExpenseById(id: string): Promise<any | null> {
    return this.expenses.find((e) => e.id === id) || null
  }

  async createExpense(expense: any): Promise<any> {
    const newExpense = {
      ...expense,
      id: `mem_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.expenses.push(newExpense)
    return newExpense
  }

  async updateExpense(id: string, updates: any): Promise<any> {
    const index = this.expenses.findIndex((e) => e.id === id)
    if (index === -1) return null

    const updatedExpense = {
      ...this.expenses[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    this.expenses[index] = updatedExpense
    return updatedExpense
  }

  async deleteExpense(id: string): Promise<boolean> {
    const initialLength = this.expenses.length
    this.expenses = this.expenses.filter((e) => e.id !== id)
    return this.expenses.length < initialLength
  }
}

// Factory function to create the appropriate adapter
// This will be implemented when you're ready to connect to a database
export function createDatabaseAdapter(type: string, config: any): DatabaseAdapter {
  // For now, just return the memory adapter
  return new MemoryAdapter()
}
