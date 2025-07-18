"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Plus, Target, TrendingUp, AlertTriangle } from "lucide-react"

// Example: Budget Tracking Feature Preview
export function BudgetTracker() {
  const [budgets, setBudgets] = useState([
    { id: 1, category: "Food", budget: 1000, spent: 750, currency: "EGP" },
    { id: 2, category: "Transportation", budget: 500, spent: 320, currency: "EGP" },
    { id: 3, category: "Entertainment", budget: 300, spent: 280, currency: "EGP" },
  ])

  const [newBudget, setNewBudget] = useState({ category: "", amount: "" })

  const addBudget = () => {
    if (newBudget.category && newBudget.amount) {
      setBudgets([
        ...budgets,
        {
          id: Date.now(),
          category: newBudget.category,
          budget: Number(newBudget.amount),
          spent: 0,
          currency: "EGP",
        },
      ])
      setNewBudget({ category: "", amount: "" })
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 100) return <Badge variant="destructive">Over Budget</Badge>
    if (percentage >= 90)
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Near Limit
        </Badge>
      )
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        On Track
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6" />
          Budget Tracker
        </h1>
      </div>

      {/* Add New Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Category (e.g., Food, Travel)"
              value={newBudget.category}
              onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Budget Amount"
              value={newBudget.amount}
              onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
            />
            <Button onClick={addBudget}>Add Budget</Button>
          </div>
        </CardContent>
      </Card>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.budget) * 100
          const remaining = budget.budget - budget.spent

          return (
            <Card key={budget.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{budget.category}</CardTitle>
                  {getStatusBadge(percentage)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      Spent: {budget.spent} {budget.currency}
                    </span>
                    <span>
                      Budget: {budget.budget} {budget.currency}
                    </span>
                  </div>
                  <Progress value={Math.min(percentage, 100)} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{percentage.toFixed(1)}% used</span>
                    <span className={remaining < 0 ? "text-red-600" : "text-green-600"}>
                      {remaining >= 0
                        ? `${remaining} ${budget.currency} left`
                        : `${Math.abs(remaining)} ${budget.currency} over`}
                    </span>
                  </div>
                </div>

                {percentage >= 90 && (
                  <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Approaching budget limit!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Budget Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Budget Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{budgets.reduce((sum, b) => sum + b.budget, 0)} EGP</p>
              <p className="text-sm text-muted-foreground">Total Budget</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{budgets.reduce((sum, b) => sum + b.spent, 0)} EGP</p>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {budgets.reduce((sum, b) => sum + (b.budget - b.spent), 0)} EGP
              </p>
              <p className="text-sm text-muted-foreground">Remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
