import { MoneyAnalyzer } from "@/components/money-analyzer";
import { getAppUser } from "@/lib/workspace";
import { getExpenses } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export default async function MoneyPage() {
  const user = await getAppUser();
  const expenses = await getExpenses(user.id);
  const categoryBudgets = await prisma.categoryBudget.findMany({
    where: { userId: user.id },
  });

  return <MoneyAnalyzer initialExpenses={expenses} categoryBudgets={categoryBudgets} />;
}
