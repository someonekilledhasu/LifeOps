import { AppShell } from "@/components/app-shell";
import { APP_USER } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <AppShell user={APP_USER}>{children}</AppShell>;
}
