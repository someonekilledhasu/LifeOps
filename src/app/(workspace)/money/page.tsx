import { MoneyAnalyzer } from "@/components/money-analyzer";
import { getAppUser } from "@/lib/workspace";
import { getExpenses } from "@/lib/data";

export default async function MoneyPage() {
  const user = await getAppUser();
  const expenses = await getExpenses(user.id);
  return <MoneyAnalyzer initialExpenses={expenses} />;
}
