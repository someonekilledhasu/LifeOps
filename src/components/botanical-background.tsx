import { Flower2, Leaf, Sparkles } from "lucide-react";
import { MiniBow } from "@/components/coquette-companions";

export function BotanicalBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-8 top-20 rotate-[-18deg] opacity-70">
        <BotanicalSprig />
      </div>
      <div className="absolute -right-10 top-[28%] rotate-[22deg] opacity-65">
        <BotanicalSprig flip />
      </div>
      <div className="absolute -bottom-10 left-[9%] rotate-[12deg] opacity-60">
        <BotanicalSprig />
      </div>
      <div className="absolute bottom-6 right-[8%] rotate-[-24deg] opacity-65">
        <BotanicalSprig flip />
      </div>
      <MiniBow className="absolute left-[7%] top-[46%] scale-125 opacity-75" />
      <MiniBow className="absolute right-[12%] top-16 scale-150 opacity-80" />
      <MiniBow className="absolute bottom-[22%] right-[28%] scale-110 opacity-65" />
      <Sparkles className="absolute left-[26%] top-24 h-5 w-5 text-pink-400/60" />
      <Sparkles className="absolute bottom-[18%] left-[43%] h-4 w-4 text-fuchsia-400/45" />
      <Sparkles className="absolute right-[34%] top-[34%] h-4 w-4 text-pink-400/50" />
    </div>
  );
}

function BotanicalSprig({ flip = false }: { flip?: boolean }) {
  return (
    <div className={`relative h-52 w-28 ${flip ? "-scale-x-100" : ""}`}>
      <div className="absolute left-14 top-8 h-44 w-px rotate-[18deg] bg-emerald-500/45 dark:bg-emerald-300/45" />
      <Leaf className="absolute left-6 top-20 h-9 w-9 rotate-[-38deg] fill-emerald-200 text-emerald-500/70 dark:fill-emerald-900 dark:text-emerald-300/65" />
      <Leaf className="absolute left-14 top-28 h-10 w-10 rotate-[42deg] fill-green-200 text-emerald-500/65 dark:fill-green-900 dark:text-emerald-300/60" />
      <Leaf className="absolute left-8 top-40 h-8 w-8 rotate-[-32deg] fill-emerald-100 text-green-500/65 dark:fill-emerald-950 dark:text-green-300/60" />
      <Flower2 className="absolute left-8 top-0 h-16 w-16 fill-pink-100 text-pink-500/75 dark:fill-pink-950 dark:text-pink-300/75" strokeWidth={1.45} />
      <Flower2 className="absolute left-2 top-36 h-9 w-9 fill-rose-100 text-rose-400/70 dark:fill-rose-950 dark:text-rose-300/70" strokeWidth={1.5} />
      <span className="absolute left-[3.2rem] top-[1.65rem] h-3 w-3 rounded-full bg-yellow-200 ring-2 ring-pink-50 dark:bg-amber-300 dark:ring-pink-950" />
    </div>
  );
}
