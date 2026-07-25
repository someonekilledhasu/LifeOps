import Papa from "papaparse";
import { NextResponse } from "next/server";
import { APP_USER } from "@/lib/workspace";
import { categorizeMerchant } from "@/lib/expenses";
import { createManyExpenses } from "@/lib/data";
import type { ExpenseCategoryLabel } from "@/lib/types";

const pick = (row: Record<string, string>, names: string[]) => {
  const key = Object.keys(row).find((candidate) => names.includes(candidate.trim().toLowerCase()));
  return key ? row[key] : "";
};

export async function POST(request: Request) {
  try {
    const file = (await request.formData()).get("file");
    if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".csv")) return NextResponse.json({ error: "Upload a CSV statement." }, { status: 400 });
    if (file.size > 2_000_000) return NextResponse.json({ error: "CSV files must be smaller than 2 MB." }, { status: 400 });
    const parsed = Papa.parse<Record<string, string>>(await file.text(), { header: true, skipEmptyLines: true });
    const items: Array<{ date: string; merchant: string; amount: number; category: ExpenseCategoryLabel; source: string }> = [];
    parsed.data.slice(0, 500).forEach((row) => {
      const merchant = pick(row, ["merchant", "description", "narration", "details", "payee", "name"]).trim();
      const amount = Number(pick(row, ["amount", "debit", "withdrawal", "value"]).replace(/[,₹$]/g, ""));
      const rawDate = pick(row, ["date", "transaction date", "txn date", "value date"]);
      const date = new Date(rawDate);
      if (!merchant || !Number.isFinite(amount) || amount <= 0 || Number.isNaN(date.getTime())) return;
      items.push({ date: date.toISOString(), merchant, amount, category: categorizeMerchant(merchant), source: "csv" });
    });
    if (!items.length) return NextResponse.json({ error: "No valid expenses were found. Include date, merchant or description, and amount columns." }, { status: 400 });
    const expenses = await createManyExpenses(APP_USER.id, items);
    return NextResponse.json({ expenses });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not parse that CSV statement." }, { status: 500 });
  }
}
