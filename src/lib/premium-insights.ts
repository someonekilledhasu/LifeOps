import {
  differenceInCalendarDays,
  format,
  isSameDay,
  subDays,
} from "date-fns";
import { formatCurrency } from "@/lib/utils";
import type {
  ExpenseRecord,
  FoodDecisionRecord,
  GeneratedMessageRecord,
} from "@/lib/types";

export const WEEKLY_FOOD_BUDGET = 2_000;

const EATING_OUT_PATTERN =
  /zomato|swiggy|cafe|coffee|restaurant|pizza|biryani|blue tokai/i;
const IMPULSE_CATEGORY_PATTERN = /shopping|entertainment|travel/i;
const STRESS_PATTERN = /stress|deadline|tired|rough|late-night/i;

type InsightTone = "positive" | "warning" | "neutral";

export type DailyBriefing = {
  greeting: string;
  bullets: string[];
  recommendation: string;
};

export type RegretPrediction = {
  similarPurchases: number;
  regretRate: number;
  risk: "Low" | "Medium" | "High";
  suggestedAction: string;
  detail: string;
};

export type ShouldIResult = {
  verdict: string;
  title: string;
  reasoning: string;
  considerations: string[];
  confidence: number;
};

export type LifePattern = {
  title: string;
  insight: string;
  detail: string;
  tone: InsightTone;
};

export type TimelineEntry = {
  id: string;
  date: string;
  title: string;
  detail: string;
  type: "expense" | "food" | "message";
};

export type LifeStreak = {
  label: string;
  days: number;
  detail: string;
};

export type LifeScoreMetric = {
  label: string;
  value: number;
  detail: string;
};

export type LifeScore = {
  overall: number;
  metrics: LifeScoreMetric[];
};

export type SubscriptionItem = {
  merchant: string;
  amount: number;
};

export type WeeklyLifeReport = {
  spent: number;
  mostOrdered: string;
  topCategory: string;
  mostUsedMessage: string;
  biggestWin: string;
  subscriptionsTotal: number;
  generatedAt: string;
};

const toDate = (value: string) => new Date(value);

const isWithinDays = (value: string, days: number) =>
  differenceInCalendarDays(new Date(), toDate(value)) >= 0 &&
  differenceInCalendarDays(new Date(), toDate(value)) < days;

const isEatingOut = (expense: ExpenseRecord) =>
  expense.category === "Food" && EATING_OUT_PATTERN.test(expense.merchant);

const average = (values: number[]) =>
  values.length
    ? values.reduce((total, value) => total + value, 0) / values.length
    : 0;

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, Math.round(value)));

const mode = (values: string[], fallback: string) => {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return (
    [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? fallback
  );
};

export function createDailyBriefing(
  name: string,
  expenses: ExpenseRecord[],
  messages: GeneratedMessageRecord[],
): DailyBriefing {
  const now = new Date();
  const hour = now.getHours();
  const salutation =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const todayFoodSpend = expenses
    .filter(
      (expense) =>
        expense.category === "Food" && isSameDay(toDate(expense.date), now),
    )
    .reduce((total, expense) => total + expense.amount, 0);
  const recentFoodExpenses = expenses.filter(
    (expense) => expense.category === "Food" && isWithinDays(expense.date, 7),
  );
  const eatingOutCount = recentFoodExpenses.filter(isEatingOut).length;
  const weeklyFoodSpend = recentFoodExpenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );
  const foodBudgetDifference = weeklyFoodSpend - WEEKLY_FOOD_BUDGET;
  const recentMessages = messages.filter((message) =>
    isWithinDays(message.createdAt, 7),
  ).length;

  return {
    greeting: `${salutation}, ${name}`,
    bullets: [
      `You spent ${formatCurrency(todayFoodSpend)} on food today`,
      `You've eaten out ${eatingOutCount} time${eatingOutCount === 1 ? "" : "s"} this week`,
      foodBudgetDifference > 0
        ? `You exceeded your weekly food budget by ${formatCurrency(foodBudgetDifference)}`
        : `You still have ${formatCurrency(Math.abs(foodBudgetDifference))} left in your weekly food budget`,
      `You generated ${recentMessages} professional message${recentMessages === 1 ? "" : "s"}`,
    ],
    recommendation:
      foodBudgetDifference > 0 || eatingOutCount >= 3
        ? "Cook at home tomorrow and save approximately ₹250."
        : "You are pacing well. Plan one home-cooked meal tomorrow to protect your buffer.",
  };
}

export function predictRegret(
  input: Pick<ExpenseRecord, "amount" | "category" | "merchant">,
  expenses: ExpenseRecord[],
): RegretPrediction {
  const categoryMatches = expenses.filter(
    (expense) => expense.category === input.category,
  );
  const merchantMatches = expenses.filter(
    (expense) =>
      expense.merchant.toLowerCase() === input.merchant.trim().toLowerCase(),
  );
  const similarPurchases = Math.max(
    1,
    merchantMatches.length || categoryMatches.length,
  );
  const categoryAverage = average(
    categoryMatches.map((expense) => expense.amount),
  );
  const isImpulse = IMPULSE_CATEGORY_PATTERN.test(input.category);
  const isAboveAverage =
    categoryAverage > 0 && input.amount > categoryAverage * 1.15;
  const isLarge = input.amount >= 2_000;

  const regretRate = clamp(
    26 +
      (isImpulse ? 24 : 0) +
      (isAboveAverage ? 18 : 0) +
      (isLarge ? 14 : 0) +
      Math.min(12, merchantMatches.length * 4),
    18,
    92,
  );
  const risk = regretRate >= 65 ? "High" : regretRate >= 45 ? "Medium" : "Low";

  return {
    similarPurchases,
    regretRate,
    risk,
    suggestedAction:
      risk === "High"
        ? "Wait 48 hours before buying."
        : risk === "Medium"
          ? "Pause for 24 hours and compare it with your weekly priorities."
          : "This looks reasonable. Log it and keep your budget buffer intact.",
    detail:
      categoryAverage > 0
        ? `Your usual ${input.category.toLowerCase()} purchase is ${formatCurrency(categoryAverage)}.`
        : `This will become your baseline for ${input.category.toLowerCase()} purchases.`,
  };
}

export function evaluateShouldI(
  question: string,
  expenses: ExpenseRecord[],
): ShouldIResult {
  const normalized = question.toLowerCase();
  const weeklyFoodSpend = expenses
    .filter(
      (expense) => expense.category === "Food" && isWithinDays(expense.date, 7),
    )
    .reduce((total, expense) => total + expense.amount, 0);
  const eatingOutCount = expenses.filter(
    (expense) => isEatingOut(expense) && isWithinDays(expense.date, 7),
  ).length;

  if (/skip|class|lecture|college/.test(normalized)) {
    return {
      verdict: "Probably not",
      title: "Keep the commitment unless you truly need rest.",
      reasoning:
        "Skipping creates a future task for you. If you are unwell, take the break intentionally and make a catch-up plan before you log off.",
      considerations: [
        "Is this recovery or avoidance?",
        "Can you attend and leave early if needed?",
        "Schedule a catch-up block if you skip.",
      ],
      confidence: 88,
    };
  }

  if (/order|biryani|pizza|swiggy|zomato|takeout|food/.test(normalized)) {
    const overBudget = weeklyFoodSpend > WEEKLY_FOOD_BUDGET;

    return {
      verdict: overBudget || eatingOutCount >= 3 ? "Cook at home" : "You can, thoughtfully",
      title:
        overBudget || eatingOutCount >= 3
          ? "Give tomorrow-you the ₹250 win."
          : "There is room, but make it a deliberate treat.",
      reasoning: `You have spent ${formatCurrency(weeklyFoodSpend)} on food and eaten out ${eatingOutCount} time${eatingOutCount === 1 ? "" : "s"} this week.`,
      considerations: [
        "Try a 15-minute homemade option first.",
        "If you still order, set a clear spend ceiling.",
        "Log how the choice felt afterward.",
      ],
      confidence: 91,
    };
  }

  if (/buy|headphone|shopping|amazon|cart|purchase/.test(normalized)) {
    const shoppingSpend = expenses
      .filter(
        (expense) =>
          expense.category === "Shopping" && isWithinDays(expense.date, 30),
      )
      .reduce((total, expense) => total + expense.amount, 0);

    return {
      verdict: shoppingSpend > 2_000 ? "Wait 48 hours" : "Pause before buying",
      title: "Let the excitement settle before you decide.",
      reasoning: `Your shopping spend is ${formatCurrency(shoppingSpend)} over the last 30 days. A short wait protects you from an impulse buy without taking the option away.`,
      considerations: [
        "Would you still want it after two sleeps?",
        "Is it replacing something or adding clutter?",
        "Compare the price with one meaningful goal.",
      ],
      confidence: 84,
    };
  }

  return {
    verdict: "Take a 10-minute pause",
    title: "Name the trade-off, then choose.",
    reasoning:
      "This decision is not strongly linked to a known spending pattern yet. A short pause usually makes the real priority easier to see.",
    considerations: [
      "What gets easier if you say yes?",
      "What gets delayed if you say yes?",
      "Will tomorrow-you agree with the choice?",
    ],
    confidence: 72,
  };
}

export function createLifePatterns(expenses: ExpenseRecord[]): LifePattern[] {
  const buckets = [
    { label: "between 9 PM and 11 PM", from: 21, to: 23 },
    { label: "during the evening", from: 17, to: 21 },
    { label: "during the afternoon", from: 12, to: 17 },
    { label: "in the morning", from: 5, to: 12 },
    { label: "late at night", from: 23, to: 29 },
  ];

  const bucketStats = buckets.map((bucket) => {
    const matches = expenses.filter((expense) => {
      const hour = toDate(expense.date).getHours();
      const adjustedHour = hour < 5 ? hour + 24 : hour;
      return adjustedHour >= bucket.from && adjustedHour < bucket.to;
    });

    return {
      ...bucket,
      matches,
      total: matches.reduce((sum, expense) => sum + expense.amount, 0),
    };
  });
  const highestBucket = bucketStats.sort((a, b) => b.total - a.total)[0];
  const foodPercentage = highestBucket?.matches.length
    ? clamp(
        (highestBucket.matches.filter((expense) => expense.category === "Food")
          .length /
          highestBucket.matches.length) *
          100,
      )
    : 0;
  const stressExpenses = expenses.filter((expense) =>
    STRESS_PATTERN.test(`${expense.notes ?? ""} ${expense.merchant}`),
  );
  const usualAverage = average(expenses.map((expense) => expense.amount));
  const stressAverage = average(stressExpenses.map((expense) => expense.amount));
  const stressMultiplier =
    stressExpenses.length && usualAverage ? stressAverage / usualAverage : 0;

  return [
    {
      title: "Your spend window",
      insight: `Your highest spending occurs ${highestBucket?.label ?? "during the evening"}.`,
      detail: `${foodPercentage}% of those purchases are food related.`,
      tone: "warning",
    },
    {
      title: "Stress spending",
      insight:
        stressMultiplier > 1
          ? `You spend ${stressMultiplier.toFixed(1)}x more when stress shows up in your notes.`
          : "You are keeping stress spending fairly contained.",
      detail:
        stressExpenses.length > 0
          ? `${stressExpenses.length} stress-linked purchase${stressExpenses.length === 1 ? "" : "s"} detected.`
          : "Add a quick note to expenses to unlock this pattern.",
      tone: stressMultiplier > 1.4 ? "warning" : "positive",
    },
    {
      title: "Budget rhythm",
      insight: `Your most active money day is ${mode(
        expenses.map((expense) => format(toDate(expense.date), "EEEE")),
        "Tuesday",
      )}.`,
      detail: "Use that day for a two-minute spending reset.",
      tone: "neutral",
    },
  ];
}

function countConsecutiveDays(dateValues: string[]) {
  const dateKeys = new Set(dateValues.map((value) => format(toDate(value), "yyyy-MM-dd")));

  for (let offset = 0; offset < 365; offset += 1) {
    const key = format(subDays(new Date(), offset), "yyyy-MM-dd");

    if (!dateKeys.has(key)) {
      return offset;
    }
  }

  return 365;
}

export function createAdultingStreaks(
  expenses: ExpenseRecord[],
  foods: FoodDecisionRecord[],
): LifeStreak[] {
  const expenseStreak = countConsecutiveDays(expenses.map((expense) => expense.date));
  const healthyStreak = countConsecutiveDays(
    foods
      .filter((food) =>
        food.suggestions.some((suggestion) => suggestion.healthiness >= 4),
      )
      .map((food) => food.createdAt),
  );
  const foodByDay = new Map<string, number>();

  for (const expense of expenses.filter((item) => item.category === "Food")) {
    const key = format(toDate(expense.date), "yyyy-MM-dd");
    foodByDay.set(key, (foodByDay.get(key) ?? 0) + expense.amount);
  }

  let underBudgetStreak = 0;
  for (let offset = 0; offset < 365; offset += 1) {
    const key = format(subDays(new Date(), offset), "yyyy-MM-dd");
    const dailyFoodSpend = foodByDay.get(key);

    if (dailyFoodSpend === undefined || dailyFoodSpend > 700) {
      break;
    }
    underBudgetStreak += 1;
  }

  return [
    {
      label: "Logged expenses",
      days: expenseStreak,
      detail: "Keep the tiny daily check-in going.",
    },
    {
      label: "Stayed under food budget",
      days: underBudgetStreak,
      detail: "Daily food spend remained below ₹700.",
    },
    {
      label: "Made healthy food choices",
      days: healthyStreak,
      detail: "Balanced decisions are becoming a pattern.",
    },
  ];
}

export function calculateLifeScore(
  expenses: ExpenseRecord[],
  foods: FoodDecisionRecord[],
  messages: GeneratedMessageRecord[],
): LifeScore {
  const trackedDays = new Set(
    expenses.map((expense) => format(toDate(expense.date), "yyyy-MM-dd")),
  ).size;
  const weeklyFoodSpend = expenses
    .filter(
      (expense) => expense.category === "Food" && isWithinDays(expense.date, 7),
    )
    .reduce((total, expense) => total + expense.amount, 0);
  const averageHealthiness = average(
    foods.flatMap((food) =>
      food.suggestions.map((suggestion) => suggestion.healthiness),
    ),
  );
  const metrics = [
    {
      label: "Financial discipline",
      value: clamp(92 - Math.max(0, weeklyFoodSpend - WEEKLY_FOOD_BUDGET) / 28),
      detail: "Budget awareness and weekly pacing",
    },
    {
      label: "Communication",
      value: clamp(58 + messages.length * 16),
      detail: "Clear, professional follow-through",
    },
    {
      label: "Food choices",
      value: clamp(42 + averageHealthiness * 10),
      detail: "Balanced meal decisions",
    },
    {
      label: "Consistency",
      value: clamp(48 + trackedDays * 4),
      detail: "Regular check-ins and expense logging",
    },
  ];

  return {
    overall: clamp(average(metrics.map((metric) => metric.value))),
    metrics,
  };
}

export function findSubscriptions(expenses: ExpenseRecord[]): SubscriptionItem[] {
  const subscriptions = new Map<string, number>();

  for (const expense of expenses.filter(
    (item) => item.category === "Subscriptions",
  )) {
    subscriptions.set(
      expense.merchant,
      (subscriptions.get(expense.merchant) ?? 0) + expense.amount,
    );
  }

  return [...subscriptions.entries()]
    .map(([merchant, amount]) => ({ merchant, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function createDecisionTimeline(
  expenses: ExpenseRecord[],
  foods: FoodDecisionRecord[],
  messages: GeneratedMessageRecord[],
): TimelineEntry[] {
  return [
    ...expenses.map((expense) => ({
      id: `expense-${expense.id}`,
      date: expense.date,
      title: `Spent ${formatCurrency(expense.amount)} at ${expense.merchant}`,
      detail: expense.category,
      type: "expense" as const,
    })),
    ...foods.map((food) => ({
      id: `food-${food.id}`,
      date: food.createdAt,
      title: `Chose ${food.suggestions[0]?.title ?? "a meal plan"}`,
      detail: `${food.mode} food decision`,
      type: "food" as const,
    })),
    ...messages.map((message) => ({
      id: `message-${message.id}`,
      date: message.createdAt,
      title: `Drafted: ${message.situation}`,
      detail: `${message.tone} professional message`,
      type: "message" as const,
    })),
  ]
    .sort((a, b) => toDate(b.date).getTime() - toDate(a.date).getTime())
    .slice(0, 8);
}

export function createWeeklyLifeReport(
  expenses: ExpenseRecord[],
  foods: FoodDecisionRecord[],
  messages: GeneratedMessageRecord[],
): WeeklyLifeReport {
  const weeklyExpenses = expenses.filter((expense) =>
    isWithinDays(expense.date, 7),
  );
  const subscriptions = findSubscriptions(expenses);
  const foodMerchantNames = weeklyExpenses
    .filter(isEatingOut)
    .map((expense) => expense.merchant);
  const categories = weeklyExpenses.map((expense) => expense.category);
  const dailyTotals = new Map<string, number>();

  for (const expense of weeklyExpenses) {
    const key = format(toDate(expense.date), "yyyy-MM-dd");
    dailyTotals.set(key, (dailyTotals.get(key) ?? 0) + expense.amount);
  }

  const controlledDays = [...dailyTotals.values()].filter(
    (amount) => amount <= 1_000,
  ).length;

  return {
    spent: weeklyExpenses.reduce((total, expense) => total + expense.amount, 0),
    mostOrdered: mode(
      foodMerchantNames,
      foods[0]?.suggestions[0]?.title ?? "No orders yet",
    ),
    topCategory: mode(categories, "No category yet"),
    mostUsedMessage: messages[0]?.situation ?? "No messages yet",
    biggestWin: `Stayed within your daily budget on ${controlledDays} day${controlledDays === 1 ? "" : "s"}`,
    subscriptionsTotal: subscriptions.reduce(
      (total, subscription) => total + subscription.amount,
      0,
    ),
    generatedAt: new Date().toISOString(),
  };
}
