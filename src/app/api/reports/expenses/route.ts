import { APP_USER } from "@/lib/workspace";
import { getExpenses } from "@/lib/data";

const csvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

export async function GET() {
  const expenses = await getExpenses(APP_USER.id);
  const csv = [
    ["Date", "Merchant", "Amount", "Category", "Notes"].map(csvCell).join(","),
    ...expenses.map((expense) => [expense.date.slice(0, 10), expense.merchant, expense.amount, expense.category, expense.notes ?? ""].map(csvCell).join(",")),
  ].join("\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="lifeops-expenses.csv"' } });
}
