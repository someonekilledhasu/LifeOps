import type { AdultingScoreResult, ExpenseRecord, FoodDecisionRecord } from "@/lib/types";

export function calculateAdultingScore(input: {
  expenses: ExpenseRecord[];
  foodDecisions: FoodDecisionRecord[];
  monthlyBudget: number;
  messageCount?: number;
}): AdultingScoreResult {
  const { expenses, foodDecisions, monthlyBudget, messageCount = 0 } = input;
  const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const ratio = monthlyBudget ? spent / monthlyBudget : 1;
  const tracked = Math.min(100, expenses.length * 7);
  const budget = ratio <= 0.85 ? 92 : ratio <= 1 ? 76 : Math.max(28, 76 - Math.round((ratio - 1) * 110));
  const categories = new Set(expenses.map((expense) => expense.category)).size;
  const spread = Math.min(100, 48 + categories * 8);
  const cuisines = new Set(foodDecisions.flatMap((decision) => decision.suggestions.map((suggestion) => suggestion.title))).size;
  const variety = Math.min(100, 46 + cuisines * 11);
  const activity = Math.min(100, 30 + foodDecisions.length * 9 + messageCount * 8 + expenses.length * 2);
  const score = Math.round(budget * 0.3 + tracked * 0.22 + spread * 0.16 + variety * 0.14 + activity * 0.18);

  const foodSpend = expenses.filter((expense) => expense.category === "Food").reduce((sum, expense) => sum + expense.amount, 0);
  const foodShare = spent ? Math.round((foodSpend / spent) * 100) : 0;
  const summary = `Your Adulting Score is ${score}. ${foodShare > 35 ? "Food spending is slightly high this month, but " : ""}your expense tracking ${tracked > 70 ? "is looking consistent" : "has room to become a steady habit"}.`;

  return {
    score,
    summary,
    breakdown: [
      { label: "Budget awareness", value: budget, detail: `${Math.round(ratio * 100)}% of monthly budget used` },
      { label: "Tracking habit", value: tracked, detail: `${expenses.length} expenses logged this month` },
      { label: "Spending spread", value: spread, detail: `${categories} active spending categories` },
      { label: "Food variety", value: variety, detail: `${foodDecisions.length} guided food decisions` },
    ],
    suggestions: [
      tracked < 70 ? "Log small cash expenses for one week to sharpen your spending picture." : "Keep the tracking streak going with a quick weekly review.",
      foodShare > 35 ? "Plan two low-effort meals before your busiest days to trim food delivery spend." : "Your food spend is in a comfortable range.",
      activity < 70 ? "Use one LifeOps decision tool this week when a small task feels oddly heavy." : "You are making good use of your LifeOps toolkit.",
    ],
  };
}
