"use client"

import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import type { BudgetWithDetails } from "@/contexts/budgets-context"

interface BudgetProgressProps {
  budget: BudgetWithDetails
  showDetails?: boolean
  className?: string
}

export function BudgetProgress({ budget, showDetails = false, className }: BudgetProgressProps) {
  const percentage = budget.percentage_used || 0
  const isOverBudget = budget.is_over_budget || false
  const isNearLimit = budget.is_near_limit || false

  // Determine progress color based on status
  const getProgressColor = () => {
    if (isOverBudget) return "bg-red-600"
    if (isNearLimit) return "bg-yellow-500"
    return "bg-green-600"
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="font-medium">
          {showDetails && <div className="text-lg font-semibold mb-1">${budget.amount.toFixed(2)}</div>}
          <span className="text-muted-foreground">${(budget.spent_amount || 0).toFixed(2)} spent</span>
        </div>
        <div className="text-right">
          <span
            className={cn(
              "font-medium",
              isOverBudget ? "text-red-600" : isNearLimit ? "text-yellow-600" : "text-green-600",
            )}
          >
            {percentage.toFixed(0)}%
          </span>
          {showDetails && (
            <div className="text-sm text-muted-foreground">
              ${Math.abs(budget.remaining_amount || 0).toFixed(2)} {isOverBudget ? "over" : "left"}
            </div>
          )}
        </div>
      </div>
      <Progress value={Math.min(percentage, 100)} className="h-2" indicatorClassName={getProgressColor()} />
    </div>
  )
}
