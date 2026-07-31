import { MoneyAnalyzer } from "@/components/money-analyzer";
import { APP_USER } from "@/lib/workspace";
import { getExpenses } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export default async function MoneyPage() {
  const expenses = await getExpenses(APP_USER.id);
  const categoryBudgets = await prisma.categoryBudget.findMany({
    where: { userId: APP_USER.id },
  });

  return <MoneyAnalyzer initialExpenses={expenses} categoryBudgets={categoryBudgets} />;
}
