import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { categoryFromDb, categoryToDb } from "@/lib/expenses";
import type { ExpenseCategoryLabel, ExpenseRecord, FoodDecisionRecord, GeneratedMessageRecord } from "@/lib/types";
import type { FoodSuggestion } from "@/lib/types";

// ─── Expenses ────────────────────────────────────────────────────────────────

export async function getExpenses(userId: string): Promise<ExpenseRecord[]> {
  const expenses = await prisma.expense.findMany({ where: { userId }, orderBy: { date: "desc" } });
  return expenses.map((expense) => ({
    id: expense.id,
    date: expense.date.toISOString(),
    merchant: expense.merchant,
    amount: Number(expense.amount),
    category: categoryFromDb[expense.category],
    notes: expense.notes ?? undefined,
    source: expense.source,
  }));
}

export async function createExpense(
  userId: string,
  input: { date: string; merchant: string; amount: number; category: ExpenseCategoryLabel; notes?: string; source?: string },
): Promise<ExpenseRecord> {
  const expense = await prisma.expense.create({
    data: {
      userId,
      date: new Date(input.date),
      merchant: input.merchant,
      amount: input.amount,
      category: categoryToDb[input.category],
      notes: input.notes || null,
      source: input.source ?? "manual",
    },
  });
  return {
    id: expense.id,
    date: expense.date.toISOString(),
    merchant: expense.merchant,
    amount: Number(expense.amount),
    category: categoryFromDb[expense.category],
    notes: expense.notes ?? undefined,
    source: expense.source,
  };
}

export async function createManyExpenses(
  userId: string,
  items: Array<{ date: string; merchant: string; amount: number; category: ExpenseCategoryLabel; source?: string }>,
): Promise<ExpenseRecord[]> {
  const created = await prisma.$transaction(
    items.map((item) =>
      prisma.expense.create({
        data: {
          userId,
          date: new Date(item.date),
          merchant: item.merchant,
          amount: item.amount,
          category: categoryToDb[item.category],
          source: item.source ?? "csv",
        },
      }),
    ),
  );
  return created.map((expense) => ({
    id: expense.id,
    date: expense.date.toISOString(),
    merchant: expense.merchant,
    amount: Number(expense.amount),
    category: categoryFromDb[expense.category],
    notes: expense.notes ?? undefined,
    source: expense.source,
  }));
}

export async function updateExpense(
  userId: string,
  expenseId: string,
  input: { date: string; merchant: string; amount: number; category: ExpenseCategoryLabel; notes?: string },
): Promise<ExpenseRecord> {
  const expense = await prisma.expense.update({
    where: { id: expenseId, userId },
    data: {
      date: new Date(input.date),
      merchant: input.merchant,
      amount: input.amount,
      category: categoryToDb[input.category],
      notes: input.notes || null,
    },
  });
  return {
    id: expense.id,
    date: expense.date.toISOString(),
    merchant: expense.merchant,
    amount: Number(expense.amount),
    category: categoryFromDb[expense.category],
    notes: expense.notes ?? undefined,
    source: expense.source,
  };
}

export async function deleteExpense(userId: string, expenseId: string): Promise<void> {
  await prisma.expense.delete({ where: { id: expenseId, userId } });
}

// ─── Food decisions ──────────────────────────────────────────────────────────

export async function getFoodDecisions(userId: string): Promise<FoodDecisionRecord[]> {
  const decisions = await prisma.foodDecision.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 });
  return decisions.map((decision) => ({
    id: decision.id,
    createdAt: decision.createdAt.toISOString(),
    mood: decision.mood,
    mode: decision.mode,
    suggestions: decision.suggestions as FoodDecisionRecord["suggestions"],
  }));
}

export async function createFoodDecision(
  userId: string,
  input: { budget: number; diet: string; cuisine?: string; mood: string; timeMinutes: number; mode: string; health: string; suggestions: FoodSuggestion[] },
): Promise<FoodDecisionRecord> {
  const decision = await prisma.foodDecision.create({
    data: {
      userId,
      budget: input.budget,
      diet: input.diet,
      cuisine: input.cuisine ?? null,
      mood: input.mood,
      timeMinutes: input.timeMinutes,
      mode: input.mode,
      health: input.health,
      suggestions: input.suggestions as unknown as Prisma.InputJsonValue,
    },
  });
  return {
    id: decision.id,
    createdAt: decision.createdAt.toISOString(),
    mood: decision.mood,
    mode: decision.mode,
    suggestions: decision.suggestions as FoodDecisionRecord["suggestions"],
  };
}

// ─── Messages ────────────────────────────────────────────────────────────────

export async function getMessages(userId: string): Promise<GeneratedMessageRecord[]> {
  const messages = await prisma.generatedMessage.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 });
  return messages.map((message) => ({
    id: message.id,
    situation: message.situation,
    tone: message.tone,
    recipient: message.recipient,
    context: message.context,
    subject: message.subject ?? "",
    body: message.body,
    shortVersion: message.shortVersion,
    polished: message.polished,
    createdAt: message.createdAt.toISOString(),
  }));
}

export async function createMessage(
  userId: string,
  input: { situation: string; tone: string; recipient: string; context: string; subject?: string; body: string; shortVersion: string; polished: string },
): Promise<GeneratedMessageRecord> {
  const message = await prisma.generatedMessage.create({
    data: {
      userId,
      situation: input.situation,
      tone: input.tone,
      recipient: input.recipient,
      context: input.context,
      subject: input.subject ?? "",
      body: input.body,
      shortVersion: input.shortVersion,
      polished: input.polished,
    },
  });
  return {
    id: message.id,
    situation: message.situation,
    tone: message.tone,
    recipient: message.recipient,
    context: message.context,
    subject: message.subject ?? "",
    body: message.body,
    shortVersion: message.shortVersion,
    polished: message.polished,
    createdAt: message.createdAt.toISOString(),
  };
}

// ─── Settings ────────────────────────────────────────────────────────────────

export type UserSettingsRecord = {
  name: string;
  monthlyBudget: number;
  currency: string;
  dietaryPreference: string;
  favoriteCuisines: string[];
  darkMode: boolean;
  weeklyEmailsEnabled: boolean;
};

const defaultSettings: UserSettingsRecord = {
  name: "User",
  monthlyBudget: 30000,
  currency: "INR",
  dietaryPreference: "flexible",
  favoriteCuisines: ["Indian", "Asian", "Mediterranean"],
  darkMode: false,
  weeklyEmailsEnabled: false,
};

export async function getSettings(userId: string): Promise<UserSettingsRecord> {
  const settings = await prisma.userSettings.findUnique({ where: { userId }, include: { user: true } });
  if (!settings) return defaultSettings;
  return {
    name: settings.user.name,
    monthlyBudget: settings.monthlyBudget,
    currency: settings.currency,
    dietaryPreference: settings.dietaryPreference,
    favoriteCuisines: settings.favoriteCuisines,
    darkMode: settings.darkMode,
    weeklyEmailsEnabled: settings.weeklyEmailsEnabled,
  };
}

export async function upsertSettings(
  userId: string,
  input: UserSettingsRecord,
): Promise<UserSettingsRecord> {
  await prisma.user.update({ where: { id: userId }, data: { name: input.name } });
  await prisma.userSettings.upsert({
    where: { userId },
    create: {
      userId,
      monthlyBudget: input.monthlyBudget,
      currency: input.currency,
      dietaryPreference: input.dietaryPreference,
      favoriteCuisines: input.favoriteCuisines,
      darkMode: input.darkMode,
      weeklyEmailsEnabled: input.weeklyEmailsEnabled,
      onboardingDone: true,
    },
    update: {
      monthlyBudget: input.monthlyBudget,
      currency: input.currency,
      dietaryPreference: input.dietaryPreference,
      favoriteCuisines: input.favoriteCuisines,
      darkMode: input.darkMode,
      weeklyEmailsEnabled: input.weeklyEmailsEnabled,
    },
  });
  return input;
}
