import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { APP_USER } from "@/lib/workspace";
import { getExpenses } from "@/lib/data";
import { expenseSchema } from "@/lib/validators";

export async function GET() {
  return NextResponse.json({ expenses: await getExpenses(APP_USER.id) });
}

export async function POST(request: Request) {
  try {
    const input = expenseSchema.parse(await request.json());
    const expense = { id: `${APP_USER.id}-expense-${Date.now()}`, ...input, date: new Date(input.date).toISOString(), source: "manual" };
    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Please check the expense details." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "Could not add that expense." }, { status: 500 });
  }
}
