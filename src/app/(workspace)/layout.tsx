import { AppShell } from "@/components/app-shell";
import { getAppUser } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await getAppUser();
  return <AppShell user={user}>{children}</AppShell>;
}
