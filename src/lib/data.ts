import { prisma } from "@/lib/prisma";
import { GUEST_USER_ID } from "@/lib/workspace";
import { demoExpenses, demoFoodDecisions, demoMessages } from "@/lib/demo-data";
import { categoryFromDb } from "@/lib/expenses";
import type { ExpenseRecord, FoodDecisionRecord, GeneratedMessageRecord } from "@/lib/types";

export async function getExpenses(userId: string): Promise<ExpenseRecord[]> {
  if (userId === GUEST_USER_ID) return demoExpenses;
  const expenses = await prisma.expense.findMany({ where: { userId }, orderBy: { date: "desc" } });
  return expenses.map((expense) => ({
    id: expense.id,
    date: expense.date.toISOString(),
    merchant: expense.merchant,
    amount: Number(expense.amount),
    currency: expense.currency,
    exchangeRate: Number(expense.exchangeRate),
    category: categoryFromDb[expense.category],
    notes: expense.notes ?? undefined,
    source: expense.source,
  }));
}

export async function getFoodDecisions(userId: string): Promise<FoodDecisionRecord[]> {
  if (userId === GUEST_USER_ID) return demoFoodDecisions;
  const decisions = await prisma.foodDecision.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 });
  return decisions.map((decision) => ({
    id: decision.id,
    createdAt: decision.createdAt.toISOString(),
    mood: decision.mood,
    mode: decision.mode,
    suggestions: decision.suggestions as FoodDecisionRecord["suggestions"],
  }));
}

export async function getMessages(userId: string): Promise<GeneratedMessageRecord[]> {
  if (userId === GUEST_USER_ID) return demoMessages;
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
