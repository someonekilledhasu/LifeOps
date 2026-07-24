"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChefHat,
  CircleDollarSign,
  Home,
  Menu,
  MessagesSquare,
  MessageSquareText,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { CoquetteCompanions, MiniBow } from "@/components/coquette-companions";
import { Button } from "@/components/ui/button";
import { ScrollToTop } from "@/components/scroll-to-top";import { cn, initials } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/food", label: "Decide food", icon: ChefHat },
  { href: "/money", label: "Money", icon: CircleDollarSign },
  { href: "/messages", label: "Messages", icon: MessageSquareText },
  { href: "/coach", label: "Life coach", icon: MessagesSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ user, children }: { user: { name?: string | null; email?: string | null; id: string }; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <>
      <div className="px-4 py-5"><Logo /></div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="relative m-3 rounded-[1.6rem] bg-gradient-to-br from-rose-300 via-pink-400 to-rose-600 p-4 text-white shadow-lg">
        <MiniBow className="absolute -right-1 -top-2 scale-75" />
        <Sparkles className="h-4 w-4 text-pink-100" />
        <p className="mt-3 text-sm font-semibold">Tiny wins add up.</p>
        <p className="mt-1 text-xs leading-5 text-rose-50">Your score reflects the little things you keep showing up for.</p>
      </div>
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">{initials(user.name)}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div>
          <Link aria-label="Back to home" href="/" className="text-muted-foreground hover:text-foreground"><Home className="h-4 w-4" /></Link>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-pink-100 dark:bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-pink-300 bg-card dark:border-pink-900 md:flex">{nav}</aside>
      {open && <button aria-label="Close navigation backdrop" className="fixed inset-0 z-40 bg-pink-500/30 md:hidden" onClick={() => setOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-card shadow-2xl transition-transform md:hidden", open ? "translate-x-0" : "-translate-x-full")}>
        <Button size="icon" variant="ghost" className="absolute right-3 top-4" onClick={() => setOpen(false)}><X className="h-5 w-5" /></Button>
        {nav}
      </aside>
      <header className="sticky top-0 z-20 flex h-16 items-center border-b border-pink-300 bg-pink-100 px-4 dark:border-pink-900 dark:bg-card md:hidden">
        <Button size="icon" variant="ghost" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></Button>
        <p className="ml-3 font-semibold">LifeOps</p>
      </header>
<CoquetteCompanions />
      <ScrollToTop />      <main className="md:pl-64 xl:pr-52">{children}</main>
    </div>
  );
}
