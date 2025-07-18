"use client"

import { useBudgets } from "@/contexts/budgets-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BudgetProgress } from "@/components/budgets/budget-progress"
import { Plus, TrendingUp, AlertTriangle, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface BudgetOverviewProps {
  dictionary: any
  lang: string
  onCreateBudget?: () => void
}

export function BudgetOverview({ dictionary, lang, onCreateBudget }: BudgetOverviewProps) {
  const { budgets, loading } = useBudgets()
  const isRtl = lang === "ar"

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading budgets...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeBudgets = budgets.filter((budget) => budget.is_active)
  const overBudgetCount = activeBudgets.filter((budget) => budget.is_over_budget).length
  const nearLimitCount = activeBudgets.filter((budget) => budget.is_near_limit && !budget.is_over_budget).length
  const onTrackCount = activeBudgets.length - overBudgetCount - nearLimitCount

  const totalBudgeted = activeBudgets.reduce((sum, budget) => sum + budget.amount, 0)
  const totalSpent = activeBudgets.reduce((sum, budget) => sum + (budget.spent_amount || 0), 0)
  const totalRemaining = totalBudgeted - totalSpent

  if (activeBudgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="text-muted-foreground">
              No budgets created yet. Start tracking your spending by creating your first budget.
            </div>
            {onCreateBudget && (
              <Button onClick={onCreateBudget} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Budget
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <div className="text-sm font-medium text-muted-foreground">Total Budgets</div>
            </div>
            <div className="text-2xl font-bold">{activeBudgets.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <div className="text-sm font-medium text-muted-foreground">On Track</div>
            </div>
            <div className="text-2xl font-bold text-green-600">{onTrackCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <div className="text-sm font-medium text-muted-foreground">Near Limit</div>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{nearLimitCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <div className="text-sm font-medium text-muted-foreground">Over Budget</div>
            </div>
            <div className="text-2xl font-bold text-red-600">{overBudgetCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Active Budgets
            </CardTitle>
            {onCreateBudget && (
              <Button variant="outline" size="sm" onClick={onCreateBudget} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Budget
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeBudgets.slice(0, 5).map((budget) => (
            <BudgetProgress key={budget.id} budget={budget} showDetails={true} />
          ))}

          {activeBudgets.length > 5 && (
            <div className="text-center pt-4">
              <Button variant="ghost" size="sm">
                View All Budgets ({activeBudgets.length - 5} more)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall Budget Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Budget Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Total Budgeted</div>
              <div className="text-2xl font-bold">${totalBudgeted.toFixed(2)}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Total Spent</div>
              <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Remaining</div>
              <div className={cn("text-2xl font-bold", totalRemaining < 0 ? "text-red-600" : "text-green-600")}>
                ${Math.abs(totalRemaining).toFixed(2)}
                {totalRemaining < 0 && " over"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
