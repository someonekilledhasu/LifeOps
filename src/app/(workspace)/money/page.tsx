import { MoneyAnalyzer } from "@/components/money-analyzer";
import { APP_USER } from "@/lib/workspace";
import { getExpenses } from "@/lib/data";

export default async function MoneyPage() {
  const expenses = await getExpenses(APP_USER.id);
  return <MoneyAnalyzer initialExpenses={expenses} />;
}
