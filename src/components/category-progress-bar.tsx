import { formatCurrency } from "@/lib/utils";
import type { ExpenseRecord } from "@/lib/types";
import { categoryFromDb } from "@/lib/expenses";
import { useMemo } from "react";
import { isSameMonth } from "date-fns";

export type CategoryBudgetLimit = {
  category: string;
  limit: number;
};

export function CategoryProgressBar({
  budgets,
  expenses,
}: {
  budgets: CategoryBudgetLimit[];
  expenses: ExpenseRecord[];
}) {
  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter((e) => isSameMonth(new Date(e.date), now));
  }, [expenses]);

  const spentByCategory = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const exp of currentMonthExpenses) {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
    }
    return totals;
  }, [currentMonthExpenses]);

  if (!budgets || budgets.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No category budgets set. You can set them in Settings.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {budgets.map((budget) => {
        const uiCategory = categoryFromDb[budget.category as keyof typeof categoryFromDb] || budget.category;
        const spent = spentByCategory[uiCategory] || 0;
        const percentage = Math.min(budget.limit > 0 ? (spent / budget.limit) * 100 : 0, 100);
        const isWarning = percentage >= 90;

        return (
          <div key={budget.category} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{uiCategory}</span>
              <span className="text-muted-foreground">
                <span className={isWarning ? "text-destructive font-bold" : ""}>
                  {formatCurrency(spent)}
                </span>{" "}
                / {formatCurrency(budget.limit)}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full transition-all duration-500 ease-in-out ${
                  isWarning ? "bg-destructive" : "bg-primary"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            {isWarning && (
              <p className="text-xs text-destructive">
                You've reached {Math.round(percentage)}% of your limit for{" "}
                {budget.category.toLowerCase()}.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
