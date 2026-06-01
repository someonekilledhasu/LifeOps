"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, isWithinInterval, subDays } from "date-fns";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ArrowRight, ChefHat, CircleDollarSign, MessageSquareText, Sparkles, TrendingUp, WalletCards } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MiniBow, PearlDivider } from "@/components/coquette-companions";
import { Badge } from "@/components/ui/badge";
import { calculateAdultingScore } from "@/lib/score";
import { spendingAnalytics } from "@/lib/expenses";
import { formatCurrency } from "@/lib/utils";
import type { ExpenseRecord, FoodDecisionRecord, GeneratedMessageRecord } from "@/lib/types";

const actions = [
  { href: "/food", title: "Decide food", text: "Match a meal to this exact moment.", icon: ChefHat, color: "bg-pink-500/10 text-pink-600" },
  { href: "/money", title: "Analyze spending", text: "Turn expenses into something useful.", icon: CircleDollarSign, color: "bg-rose-500/10 text-rose-600" },
  { href: "/messages", title: "Generate message", text: "Get the words out of your head.", icon: MessageSquareText, color: "bg-fuchsia-500/10 text-fuchsia-600" },
];

export function Dashboard({ name, expenses, foods, messages }: { name: string; expenses: ExpenseRecord[]; foods: FoodDecisionRecord[]; messages: GeneratedMessageRecord[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const monthSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const score = calculateAdultingScore({ expenses, foodDecisions: foods, monthlyBudget: 30000, messageCount: messages.length });
  const analytics = spendingAnalytics(expenses);
  const weekStart = subDays(new Date(), 6);
  const weekly = Array.from({ length: 7 }, (_, index) => {
    const day = subDays(new Date(), 6 - index);
    const amount = expenses.filter((expense) => isWithinInterval(new Date(expense.date), { start: day, end: day }) || format(new Date(expense.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")).reduce((sum, expense) => sum + expense.amount, 0);
    return { day: format(day, "EEE"), amount };
  });
  const weeklySpend = expenses.filter((expense) => new Date(expense.date) >= weekStart).reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-7 lg:p-9">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, d MMMM")}</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Good to see you, {name.split(" ")[0]}.</h1></div>
        <Badge className="w-fit bg-secondary text-secondary-foreground"><Sparkles className="mr-1 h-3 w-3" /> Open guest workspace</Badge>
      </div>
      <div className="mt-2 w-36"><PearlDivider /></div>

      <div className="mt-7 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-rose-300 via-pink-500 to-rose-700 text-white shadow-glow">
          <MiniBow className="absolute right-5 top-5 scale-125" />
          <CardContent className="p-6">
            <p className="text-sm font-medium text-rose-50">Adulting Score</p>
            <div className="mt-3 flex items-end gap-2"><span className="text-7xl font-bold tracking-tight">{score.score}</span><span className="pb-2 text-lg text-pink-100">/ 100</span></div>
            <p className="mt-4 max-w-md text-sm leading-6 text-rose-50">{score.summary}</p>
            <Link href="/settings" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-pink-100 hover:text-white">View your setup <ArrowRight className="h-4 w-4" /></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div><p className="text-sm text-muted-foreground">Last 7 days</p><CardTitle className="mt-1 text-2xl">{formatCurrency(weeklySpend)}</CardTitle></div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/10 text-rose-600"><TrendingUp className="h-5 w-5" /></div>
          </CardHeader>
          <CardContent>
            <div className="h-36">
              {mounted ? <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={weekly}>
                  <defs><linearGradient id="dashboardGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#e1719a" stopOpacity={0.5} /><stop offset="95%" stopColor="#e1719a" stopOpacity={0} /></linearGradient></defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area type="monotone" dataKey="amount" stroke="#d95788" strokeWidth={3} fill="url(#dashboardGradient)" />
                </AreaChart>
              </ResponsiveContainer> : <div className="h-full animate-pulse rounded-xl bg-muted" />}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Stat label="Spent this month" value={formatCurrency(monthSpent)} icon={WalletCards} />
        <Stat label="Food decisions" value={`${foods.length} solved`} icon={ChefHat} />
        <Stat label="Messages drafted" value={`${messages.length} ready`} icon={MessageSquareText} />
      </div>

      <h2 className="mt-9 text-lg font-bold">What do you want to sort out?</h2>
      <div className="mt-3 grid gap-4 lg:grid-cols-3">
        {actions.map((action) => (
          <Link href={action.href} key={action.href} className="group rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className={`grid h-11 w-11 place-items-center rounded-xl ${action.color}`}><action.icon className="h-5 w-5" /></div>
            <h3 className="mt-5 font-semibold">{action.title}</h3><p className="mt-1 text-sm text-muted-foreground">{action.text}</p>
            <span className="mt-5 flex items-center gap-1 text-sm font-semibold text-primary">Open tool <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader><CardTitle>Recent AI insights</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Insight text={`${analytics.biggestCategory?.name ?? "Food"} is your biggest spending category at ${formatCurrency(analytics.biggestCategory?.value ?? 0)}.`} />
            <Insight text={`${analytics.foodPercentage}% of tracked spending is food-related. ${analytics.foodPercentage > 35 ? "A couple of planned meals could create easy breathing room." : "That is sitting in a comfortable range."}`} />
            <Insight text={`${foods.length} food decisions logged recently. Your choices are building a useful pattern.`} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Score breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {score.breakdown.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm"><span className="font-medium">{item.label}</span><span className="font-semibold">{item.value}</span></div>
                <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${item.value}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof WalletCards }) {
  return <Card><CardContent className="flex items-center gap-4 p-5"><div className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-primary"><Icon className="h-5 w-5" /></div><div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-bold">{value}</p></div></CardContent></Card>;
}

function Insight({ text }: { text: string }) {
  return <div className="flex gap-3 rounded-xl bg-pink-100 p-3 text-sm leading-6 dark:bg-pink-950"><Sparkles className="mt-1 h-4 w-4 shrink-0 text-primary" /><p>{text}</p></div>;
}
