import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 font-bold tracking-tight", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm ring-4 ring-pink-200 dark:ring-pink-900">
        <Heart className="h-4 w-4 fill-current" />
      </span>
      {!compact && <span className="font-display text-xl tracking-tight">LifeOps</span>}
    </Link>
  );
}
