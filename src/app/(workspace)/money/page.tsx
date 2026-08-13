import { MoneyAnalyzer } from "@/components/money-analyzer";
import { getAppUser } from "@/lib/workspace";
import { getExpenses, getSettings } from "@/lib/data";

export default async function MoneyPage() {
  const user = await getAppUser();
  const expenses = await getExpenses(user.id);
  const settings = await getSettings(user.id);
  const baseCurrency = settings.currency || "INR";
  return <MoneyAnalyzer initialExpenses={expenses} baseCurrency={baseCurrency} />;
}
