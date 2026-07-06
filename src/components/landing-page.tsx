"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChefHat,
  CircleDollarSign,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Moon,
  Sun,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { MiniBow, PearlDivider } from "@/components/coquette-companions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  { icon: ChefHat, title: "End the food spiral", text: "Get practical meal ideas matched to your budget, mood and time." },
  { icon: CircleDollarSign, title: "See where it went", text: "Turn messy statements into clear patterns and useful next moves." },
  { icon: MessageSquareText, title: "Say the awkward thing", text: "Draft thoughtful messages when the blank text box feels heavier than it should." },
  { icon: BarChart3, title: "Build your score", text: "Track the tiny habits that make everyday life feel more in control." },
];

const steps = [
  ["01", "Bring the small decision", "Choose a tool and add the little bit of context that matters."],
  ["02", "Get a useful answer", "LifeOps gives you focused options, not a wall of generic advice."],
  ["03", "Notice the pattern", "Your dashboard connects small actions into a clearer picture over time."],
];

export function LandingPage() {
   const { resolvedTheme, setTheme } = useTheme();
   const [mounted, setMounted] = useState(false);
    useEffect(() => {
    setMounted(true);
     }, []);
     
    return (
    <main className="overflow-hidden">
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] bg-[radial-gradient(circle_at_18%_10%,rgba(251,207,232,0.72),transparent_38%),radial-gradient(circle_at_82%_22%,rgba(253,164,175,0.3),transparent_34%)]" />
        <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how-it-works" className="hover:text-foreground">How it works</a>
            <a href="#dashboard-preview" className="hover:text-foreground">Preview</a>
          </nav>
          <div className="flex items-center gap-2">
           <Button
           variant="ghost"
           size="icon"
           onClick={() =>
           setTheme(resolvedTheme === "dark" ? "light" : "dark")
                   }
           aria-label="Toggle theme"
>
          {mounted ? (
           resolvedTheme === "dark" ? (
          <Sun className="h-5 w-5" />
           ) : (
           <Moon className="h-5 w-5" />
               )
            ) : null}
          </Button>
            <Button asChild>
              <Link href="/dashboard">Open workspace <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </header>

        <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-28 lg:pt-24">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-300 bg-pink-100 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm dark:border-pink-800 dark:bg-pink-950">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> One home for life admin
            </div>
            <h1 className="max-w-3xl text-balance font-[family-name:var(--font-manrope)] text-5xl font-extrabold leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Make everyday decisions <span className="bg-gradient-to-r from-rose-500 to-pink-400 bg-clip-text text-transparent">easier.</span>
            </h1>
            <p className="mt-6 max-w-xl text-balance text-lg leading-8 text-muted-foreground">
              LifeOps helps you decide what to eat, understand your spending, write difficult messages, and track your daily life patterns from one smart dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link href="/dashboard">Get your life admin sorted <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/food">Decide what to eat</Link></Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-rose-500" /> Free to try</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-rose-500" /> Your data stays yours</span>
            </div>
          </motion.div>

          <motion.div id="dashboard-preview" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.12 }} className="relative">
            <MiniBow className="absolute -right-3 -top-5 z-10 scale-150" />
            <MiniBow className="absolute -bottom-3 left-8 z-10 scale-125" />
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-pink-300/45 to-rose-200/35 blur-2xl" />
            <DashboardPreview />
          </motion.div>
        </section>
      </div>

      <section id="features" className="border-y border-pink-300 bg-pink-100 py-20 dark:border-pink-900 dark:bg-pink-950">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">A calmer control panel</p>
          <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-manrope)] text-3xl font-bold tracking-tight sm:text-4xl">Small decisions deserve better systems.</h2>
          <div className="mt-3 w-32"><PearlDivider /></div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
                <Card className="h-full p-5 transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><feature.icon className="h-5 w-5" /></div>
                  <h3 className="mt-5 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.text}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">How it works</p>
            <h2 className="mt-3 font-[family-name:var(--font-manrope)] text-3xl font-bold tracking-tight sm:text-4xl">Less mental clutter in three small steps.</h2>
            <div className="mt-3 w-32"><PearlDivider /></div>
          </div>
          <div className="grid gap-3">
            {steps.map(([number, title, text]) => (
              <div key={number} className="grid grid-cols-[48px_1fr] gap-4 rounded-2xl border bg-card p-5">
                <span className="text-lg font-bold text-primary">{number}</span>
                <div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-300 via-pink-500 to-rose-700 px-6 py-14 text-center text-white shadow-glow sm:px-12">
          <MiniBow className="absolute left-8 top-8 scale-150" />
          <MiniBow className="absolute bottom-8 right-10 scale-125" />
          <WandSparkles className="mx-auto h-8 w-8 text-pink-100" />
          <h2 className="mt-5 text-balance font-[family-name:var(--font-manrope)] text-3xl font-bold sm:text-4xl">Your life admin can feel lighter than this.</h2>
          <p className="mx-auto mt-3 max-w-xl text-rose-50">Start with one decision. Let LifeOps make the next one a little easier.</p>
          <Button asChild size="lg" className="mt-7 bg-white text-rose-700 hover:bg-white/90"><Link href="/dashboard">Open workspace <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <footer className="border-t border-pink-300 bg-pink-100 dark:border-pink-900 dark:bg-pink-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <Logo />
          <p>The AI that handles the annoying decisions you make every day.</p>
          <p>© 2026 LifeOps</p>
        </div>
      </footer>
    </main>
  );
  
}

function DashboardPreview() {
  const bars = [38, 64, 47, 76, 57, 88, 69];
  return (
    <div className="pink-frame rounded-[1.7rem] p-3 shadow-2xl">
      <div className="rounded-[1.35rem] bg-background p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div><p className="text-xs text-muted-foreground">Sunday, 1 June</p><p className="font-semibold">Good afternoon, Hasini</p></div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-pink-300 to-rose-400" />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-2xl bg-gradient-to-br from-rose-400 to-rose-700 p-4 text-white">
            <p className="text-xs text-rose-50">Adulting Score</p>
            <p className="mt-2 text-5xl font-bold">74</p>
            <p className="mt-3 text-xs leading-5 text-rose-50">Your tracking consistency improved this week.</p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex justify-between"><p className="text-xs text-muted-foreground">Weekly spend</p><p className="text-xs font-semibold">₹5,393</p></div>
            <div className="mt-5 flex h-20 items-end gap-2">
              {bars.map((bar, index) => <div key={index} className="flex-1 rounded-t bg-primary/70" style={{ height: `${bar}%` }} />)}
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[["Food", "₹2,840"], ["Transport", "₹785"], ["Bills", "₹799"]].map(([title, amount]) => (
            <div key={title} className="rounded-xl border bg-card p-3"><p className="text-[10px] text-muted-foreground">{title}</p><p className="mt-1 text-xs font-semibold sm:text-sm">{amount}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}
