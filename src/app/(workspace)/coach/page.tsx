import { LifeCoach } from "@/components/life-coach";
import { getAppUser } from "@/lib/workspace";

export default async function CoachPage() {
  const user = await getAppUser();
  return <LifeCoach name={user.name} />;
}
