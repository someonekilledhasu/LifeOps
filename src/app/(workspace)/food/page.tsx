import { FoodDecider } from "@/components/food-decider";
import { APP_USER } from "@/lib/workspace";
import { getFoodDecisions } from "@/lib/data";

export default async function FoodPage() {
  const history = await getFoodDecisions(APP_USER.id);
  return <FoodDecider initialHistory={history} />;
}
