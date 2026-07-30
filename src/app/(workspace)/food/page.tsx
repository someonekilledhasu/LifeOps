import { FoodDecider } from "@/components/food-decider";
import { getAppUser } from "@/lib/workspace";
import { getFoodDecisions } from "@/lib/data";

export default async function FoodPage() {
  const user = await getAppUser();
  const history = await getFoodDecisions(user.id);
  return <FoodDecider initialHistory={history} />;
}
