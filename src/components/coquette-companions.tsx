import { Apple, Heart, Sparkles, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";

const reminders = [
  {
    title: "Penny says",
    text: "A tiny budget check today keeps future-you feeling lovely.",
    icon: WalletCards,
    tone: "rose",
  },
  {
    title: "Berry says",
    text: "Add something fresh and colorful to your next little plate.",
    icon: Apple,
    tone: "cream",
  },
] as const;

export function CoquetteCompanions() {
  return (
    <>
      <aside className="pointer-events-none fixed right-4 top-24 z-10 hidden w-44 space-y-4 xl:block">
        {reminders.map((reminder) => (
          <div key={reminder.title} className="coquette-note relative rounded-[1.6rem] border border-pink-300 bg-pink-50 p-3 text-center shadow-[0_14px_35px_-20px_rgba(190,24,93,0.48)] dark:border-pink-800 dark:bg-pink-950">
            <MiniBow className="absolute -top-3 left-1/2 -translate-x-1/2" />
            <ReminderCharacter icon={reminder.icon} tone={reminder.tone} />
            <p className="mt-2 font-[family-name:var(--font-manrope)] text-sm font-bold text-fuchsia-700 dark:text-pink-200">{reminder.title}</p>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{reminder.text}</p>
          </div>
        ))}
      </aside>
      <div className="flex items-center gap-2 border-b border-pink-300 bg-pink-100 px-4 py-2.5 text-xs text-fuchsia-700 dark:border-pink-900 dark:bg-pink-950 dark:text-pink-200 xl:hidden">
        <div className="flex -space-x-2">
          <ReminderCharacter icon={WalletCards} tone="rose" compact />
          <ReminderCharacter icon={Apple} tone="cream" compact />
        </div>
        <Heart className="h-3.5 w-3.5 fill-current" />
        <p><span className="font-bold">Tiny reminder:</span> check your budget and add something fresh to your next plate.</p>
      </div>
    </>
  );
}

export function MiniBow({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-5 w-9 items-center justify-center", className)} aria-hidden="true">
      <span className="absolute left-0 h-4 w-4 rotate-[-18deg] rounded-full rounded-br-sm bg-pink-300 shadow-sm" />
      <span className="absolute right-0 h-4 w-4 rotate-[18deg] rounded-full rounded-bl-sm bg-pink-300 shadow-sm" />
      <span className="relative z-10 h-3 w-3 rounded-full bg-rose-400 ring-2 ring-pink-100" />
    </span>
  );
}

export function PearlDivider() {
  return (
    <div className="flex items-center justify-center gap-1.5 py-1 text-pink-300" aria-hidden="true">
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span className="h-2 w-2 rounded-full bg-current" />
      <Heart className="h-3.5 w-3.5 fill-current text-rose-300" />
      <span className="h-2 w-2 rounded-full bg-current" />
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
    </div>
  );
}

function ReminderCharacter({ icon: Icon, tone, compact = false }: { icon: typeof WalletCards; tone: "rose" | "cream"; compact?: boolean }) {
  return (
    <div className={cn("relative mx-auto grid place-items-center rounded-[45%] border-2 shadow-sm", compact ? "h-9 w-9" : "h-16 w-16", tone === "rose" ? "border-rose-200 bg-pink-200 text-rose-600 dark:border-pink-700 dark:bg-pink-800 dark:text-pink-100" : "border-pink-200 bg-amber-50 text-rose-500 dark:border-fuchsia-700 dark:bg-fuchsia-950 dark:text-pink-200")}>
      {!compact && <MiniBow className="absolute -right-2 -top-2 scale-75" />}
      <Icon className={cn(compact ? "h-4 w-4" : "h-6 w-6", "opacity-85")} />
      <span className={cn("absolute flex gap-2", compact ? "top-2" : "top-4")}>
        <span className="h-1 w-1 rounded-full bg-rose-900/65" />
        <span className="h-1 w-1 rounded-full bg-rose-900/65" />
      </span>
      {!compact && <span className="absolute bottom-3 h-1.5 w-3 rounded-b-full border-b border-rose-900/55" />}
      <Sparkles className={cn("absolute text-white/80", compact ? "-bottom-1 -right-1 h-3 w-3" : "-bottom-1 -left-1 h-4 w-4")} />
    </div>
  );
}
