export const expenseCategories = [
  "Food",
  "Shopping",
  "Transport",
  "Bills",
  "Subscriptions",
  "Education",
  "Entertainment",
  "Health",
  "Travel",
  "Other",
] as const;

export type ExpenseCategoryLabel = (typeof expenseCategories)[number];

export type ExpenseRecord = {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: ExpenseCategoryLabel;
  notes?: string;
  source?: string;
};

export type FoodSuggestion = {
  title: string;
  estimatedCost: number;
  whyItFits: string;
  healthiness: number;
  budgetFit: number;
  nextStep: string;
};

export type FoodDecisionRecord = {
  id: string;
  createdAt: string;
  mood: string;
  mode: string;
  suggestions: FoodSuggestion[];
};

export type MessageResult = {
  subject: string;
  body: string;
  shortVersion: string;
  polished: string;
};

export type GeneratedMessageRecord = MessageResult & {
  id: string;
  situation: string;
  tone: string;
  recipient: string;
  context: string;
  createdAt: string;
};

export type ScoreBreakdown = {
  label: string;
  value: number;
  detail: string;
};

export type AdultingScoreResult = {
  score: number;
  summary: string;
  breakdown: ScoreBreakdown[];
  suggestions: string[];
};
