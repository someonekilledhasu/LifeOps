import { LifeCoach } from "@/components/life-coach";
import { APP_USER } from "@/lib/workspace";

export default function CoachPage() {
  return <LifeCoach name={APP_USER.name} />;
}
