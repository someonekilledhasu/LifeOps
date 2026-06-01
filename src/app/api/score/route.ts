import { NextResponse } from "next/server";
import { APP_USER } from "@/lib/workspace";
import { getExpenses, getFoodDecisions, getMessages } from "@/lib/data";
import { calculateAdultingScore } from "@/lib/score";

export async function GET() {
  const [expenses, foods, messages] = await Promise.all([
    getExpenses(APP_USER.id),
    getFoodDecisions(APP_USER.id),
    getMessages(APP_USER.id),
  ]);
  const result = calculateAdultingScore({ expenses, foodDecisions: foods, monthlyBudget: 30000, messageCount: messages.length });
  return NextResponse.json(result);
}
