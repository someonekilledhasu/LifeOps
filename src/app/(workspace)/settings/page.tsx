import { SettingsPanel } from "@/components/settings-panel";
import { APP_USER } from "@/lib/workspace";

export default function SettingsPage() {
  const settings = {
    name: APP_USER.name,
    email: APP_USER.email,
    monthlyBudget: 30000,
    currency: "INR",
    dietaryPreference: "flexible",
    favoriteCuisines: ["Indian", "Asian", "Mediterranean"],
    darkMode: false,
    weeklyEmailsEnabled: false,
  };
  return <SettingsPanel initial={settings} demo />;
}
