import { SettingsPanel } from "@/components/settings-panel";
import { CategoryBudgetsForm } from "@/components/category-budgets-form";
import { getAppUser } from "@/lib/workspace";
import { getSettings } from "@/lib/data";

export default async function SettingsPage() {
  const user = await getAppUser();
  const settings = await getSettings(user.id);
  return (
    <>
      <SettingsPanel initial={{ ...settings, email: user.email }} demo={false} />
      <div className="mx-auto max-w-4xl px-5 sm:px-7 lg:px-9 pb-9">
        <CategoryBudgetsForm />
      </div>
    </>
  );
}
