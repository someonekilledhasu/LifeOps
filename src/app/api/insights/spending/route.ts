import { NextResponse } from "next/server";
import { APP_USER } from "@/lib/workspace";
import { getExpenses } from "@/lib/data";
import { spendingAnalytics } from "@/lib/expenses";

export async function GET() {
  return NextResponse.json(spendingAnalytics(await getExpenses(APP_USER.id)));
}
