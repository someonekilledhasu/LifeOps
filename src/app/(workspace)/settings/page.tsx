import { SettingsPanel } from "@/components/settings-panel";
import { CategoryBudgetsForm } from "@/components/category-budgets-form";
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
  };
  return (
    <>
      <SettingsPanel initial={settings} demo />
      <div className="mx-auto max-w-4xl px-5 sm:px-7 lg:px-9 pb-9">
        <CategoryBudgetsForm />
      </div>
    </>
  );
}
