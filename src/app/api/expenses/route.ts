import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { APP_USER } from "@/lib/workspace";
import { getExpenses, createExpense, getSettings } from "@/lib/data";
import { expenseSchema } from "@/lib/validators";

export async function GET() {
  return NextResponse.json({ expenses: await getExpenses(APP_USER.id) });
}

export async function POST(request: Request) {
  try {
    const input = expenseSchema.parse(await request.json());
    const settings = await getSettings(APP_USER.id);
    const baseCurrency = settings.currency || "INR";
    
    const currency = input.currency || baseCurrency;
    let exchangeRate = 1.0;
    
    if (currency !== baseCurrency) {
      try {
        const res = await fetch(`https://api.frankfurter.app/latest?from=${currency}&to=${baseCurrency}`);
        if (res.ok) {
          const data = await res.json();
          exchangeRate = data.rates[baseCurrency] || 1.0;
        }
      } catch (err) {
        console.error("Failed to fetch exchange rate:", err);
      }
    }

    const expense = await createExpense(APP_USER.id, { ...input, currency, exchangeRate, source: "manual" });
    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Please check the expense details." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "Could not add that expense." }, { status: 500 });
  }
}
