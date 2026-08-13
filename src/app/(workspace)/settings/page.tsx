import { SettingsPanel } from "@/components/settings-panel";
import { getAppUser } from "@/lib/workspace";
import { getSettings } from "@/lib/data";

export default async function SettingsPage() {
  const user = await getAppUser();
  const settings = await getSettings(user.id);
  return <SettingsPanel initial={{ ...settings, email: user.email }} demo={false} />;
}
