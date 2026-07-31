import { MoneyAnalyzer } from "@/components/money-analyzer";
import { APP_USER } from "@/lib/workspace";
import { getExpenses } from "@/lib/data";

export default async function MoneyPage() {
  const expenses = await getExpenses(APP_USER.id);
  const { prisma } = await import("@/lib/prisma");
  const userSettings = await prisma.userSettings.findUnique({ where: { userId: APP_USER.id } });
  const baseCurrency = userSettings?.currency || "INR";
  return <MoneyAnalyzer initialExpenses={expenses} baseCurrency={baseCurrency} />;
}
