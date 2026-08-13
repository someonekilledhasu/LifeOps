import { endOfDay, format, startOfDay } from "date-fns";
import type { ExpenseCategory } from "@prisma/client";
import type { ExpenseCategoryLabel, ExpenseRecord } from "@/lib/types";

export const categoryToDb: Record<ExpenseCategoryLabel, ExpenseCategory> = {
  Food: "FOOD",
  Shopping: "SHOPPING",
  Transport: "TRANSPORT",
  Bills: "BILLS",
  Subscriptions: "SUBSCRIPTIONS",
  Education: "EDUCATION",
  Entertainment: "ENTERTAINMENT",
  Health: "HEALTH",
  Travel: "TRAVEL",
  Other: "OTHER",
};

export const categoryFromDb = Object.fromEntries(
  Object.entries(categoryToDb).map(([label, db]) => [db, label]),
) as Record<ExpenseCategory, ExpenseCategoryLabel>;

const rules: Array<[RegExp, ExpenseCategoryLabel]> = [
  [/zomato|swiggy|blinkit|zepto|restaurant|cafe|coffee|grocery|food/i, "Food"],
  [/uber|ola|metro|fuel|petrol|rapido|irctc/i, "Transport"],
  [/netflix|spotify|prime|hotstar|subscription/i, "Subscriptions"],
  [/amazon|flipkart|myntra|store|mall/i, "Shopping"],
  [/airtel|jio|electric|water|rent|bill/i, "Bills"],
  [/pharmacy|hospital|doctor|cult|gym|health/i, "Health"],
  [/bookmyshow|cinema|game|concert/i, "Entertainment"],
  [/udemy|course|book|school|college/i, "Education"],
  [/hotel|flight|travel|makemytrip|airbnb/i, "Travel"],
];

export function categorizeMerchant(merchant: string): ExpenseCategoryLabel {
  return rules.find(([rule]) => rule.test(merchant))?.[1] ?? "Other";
}

export function spendingAnalytics(expenses: ExpenseRecord[]) {
  const categories = new Map<string, number>();
  const merchants = new Map<string, number>();
  const months = new Map<string, number>();
  const days = new Map<string, number>();

  expenses.forEach((expense) => {
    const amount = expense.amount * (expense.exchangeRate || 1);
    categories.set(expense.category, (categories.get(expense.category) ?? 0) + amount);
    merchants.set(expense.merchant, (merchants.get(expense.merchant) ?? 0) + amount);
    months.set(format(new Date(expense.date), "MMM"), (months.get(format(new Date(expense.date), "MMM")) ?? 0) + amount);
    days.set(format(new Date(expense.date), "dd MMM"), (days.get(format(new Date(expense.date), "dd MMM")) ?? 0) + amount);
  });

  const byCategory = [...categories].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const topMerchants = [...merchants].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  const byMonth = [...months].map(([month, amount]) => ({ month, amount }));
  const highestDay = [...days].map(([day, value]) => ({ day, value })).sort((a, b) => b.value - a.value)[0];
  const total = expenses.reduce((sum, expense) => sum + expense.amount * (expense.exchangeRate || 1), 0);
  const food = categories.get("Food") ?? 0;

  return {
    total,
    byCategory,
    topMerchants,
    byMonth,
    highestDay,
    foodPercentage: total ? Math.round((food / total) * 100) : 0,
    biggestCategory: byCategory[0],
  };
}

export function dateWithin(date: string, from?: string, to?: string) {
  const value = new Date(date);
  return (!from || value >= startOfDay(new Date(from))) && (!to || value <= endOfDay(new Date(to)));
}
