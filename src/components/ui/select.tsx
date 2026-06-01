import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn("flex h-11 w-full rounded-2xl border border-pink-300 bg-pink-50 px-3 py-2 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/15 dark:border-pink-900 dark:bg-pink-950", className)}
      {...props}
    />
  );
}
