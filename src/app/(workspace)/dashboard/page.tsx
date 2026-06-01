import { Dashboard } from "@/components/dashboard";
import { APP_USER } from "@/lib/workspace";
import { getExpenses, getFoodDecisions, getMessages } from "@/lib/data";

export default async function DashboardPage() {
  const userId = APP_USER.id;
  const [expenses, foods, messages] = await Promise.all([getExpenses(userId), getFoodDecisions(userId), getMessages(userId)]);
  return <Dashboard name={APP_USER.name} expenses={expenses} foods={foods} messages={messages} />;
}
