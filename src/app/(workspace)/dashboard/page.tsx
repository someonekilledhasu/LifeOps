import { Dashboard } from "@/components/dashboard";
import { getAppUser } from "@/lib/workspace";
import { getExpenses, getFoodDecisions, getMessages } from "@/lib/data";

export default async function DashboardPage() {
  const user = await getAppUser();
  const [expenses, foods, messages] = await Promise.all([getExpenses(user.id), getFoodDecisions(user.id), getMessages(user.id)]);
  return <Dashboard name={user.name} expenses={expenses} foods={foods} messages={messages} />;
}
