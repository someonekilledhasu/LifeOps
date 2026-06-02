import { differenceInCalendarDays } from "date-fns";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { coachReply } from "@/lib/ai";
import { getExpenses } from "@/lib/data";
import {
  createLifePatterns,
  findSubscriptions,
  WEEKLY_FOOD_BUDGET,
} from "@/lib/premium-insights";
import { coachInputSchema } from "@/lib/validators";
import { APP_USER } from "@/lib/workspace";

const isWithinWeek = (date: string) =>
  differenceInCalendarDays(new Date(), new Date(date)) >= 0 &&
  differenceInCalendarDays(new Date(), new Date(date)) < 7;

export async function POST(request: Request) {
  try {
    const { question } = coachInputSchema.parse(await request.json());
    const expenses = await getExpenses(APP_USER.id);
    const weeklyFoodExpenses = expenses.filter(
      (expense) => expense.category === "Food" && isWithinWeek(expense.date),
    );
    const subscriptions = findSubscriptions(expenses);
    const patterns = createLifePatterns(expenses);
    const result = await coachReply(question, {
      weeklyFoodSpend: weeklyFoodExpenses.reduce(
        (total, expense) => total + expense.amount,
        0,
      ),
      weeklyFoodBudget: WEEKLY_FOOD_BUDGET,
      eatingOutCount: weeklyFoodExpenses.filter((expense) =>
        /zomato|swiggy|cafe|coffee|restaurant|pizza|biryani|blue tokai/i.test(
          expense.merchant,
        ),
      ).length,
      subscriptionsTotal: subscriptions.reduce(
        (total, subscription) => total + subscription.amount,
        0,
      ),
      strongestPattern: patterns[0]?.insight ?? "Your daily check-ins are building a useful pattern.",
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Tell your coach a little more about what is on your mind." },
        { status: 400 },
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Your coach could not reply just yet." },
      { status: 500 },
    );
  }
}
