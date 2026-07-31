import Papa from "papaparse";
import { NextResponse } from "next/server";
import { categorizeMerchant } from "@/lib/expenses";
import type { ExpenseRecord } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { APP_USER } from "@/lib/workspace";
import { categoryFromDb } from "@/lib/expenses";

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
    
    const rules = await prisma.expenseRule.findMany({ where: { userId: APP_USER.id } });
    
    const expenses: ExpenseRecord[] = parsed.data.slice(0, 500).flatMap((row, index) => {
      const merchant = pick(row, ["merchant", "description", "narration", "details", "payee", "name"]).trim();
      const amount = Number(pick(row, ["amount", "debit", "withdrawal", "value"]).replace(/[,₹$]/g, ""));
      const rawDate = pick(row, ["date", "transaction date", "txn date", "value date"]);
      const date = new Date(rawDate);
      if (!merchant || !Number.isFinite(amount) || amount <= 0 || Number.isNaN(date.getTime())) return [];
      
      const matchedRule = rules.find((rule) => merchant.toLowerCase().includes(rule.merchantSubstring.toLowerCase()));
      const category = matchedRule ? categoryFromDb[matchedRule.targetCategory] : categorizeMerchant(merchant);
      
      return [{ id: `csv-${Date.now()}-${index}`, date: date.toISOString(), merchant, amount, category, source: "csv" }];
    });
    if (!expenses.length) return NextResponse.json({ error: "No valid expenses were found. Include date, merchant or description, and amount columns." }, { status: 400 });
    return NextResponse.json({ expenses });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not parse that CSV statement." }, { status: 500 });
  }
}
