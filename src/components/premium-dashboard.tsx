import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  Download,
  Flame,
  Flower2,
  MessageCircleHeart,
  ReceiptText,
  Repeat2,
  Sparkles,
  UtensilsCrossed,
  WalletCards,
} from "lucide-react";
import { ShouldIWidget } from "@/components/should-i-widget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateLifeScore,
  createAdultingStreaks,
  createDailyBriefing,
  createDecisionTimeline,
  createLifePatterns,
  createWeeklyLifeReport,
  findSubscriptions,
} from "@/lib/premium-insights";
import { cn, formatCurrency } from "@/lib/utils";
import type {
  ExpenseRecord,
  FoodDecisionRecord,
  GeneratedMessageRecord,
} from "@/lib/types";

type PremiumDashboardProps = {
  name: string;
  expenses: ExpenseRecord[];
  foods: FoodDecisionRecord[];
  messages: GeneratedMessageRecord[];
};

export function PremiumDashboard({
  name,
  expenses,
  foods,
  messages,
}: PremiumDashboardProps) {
  const briefing = createDailyBriefing(name, expenses, messages);
  const patterns = createLifePatterns(expenses);
  const streaks = createAdultingStreaks(expenses, foods);
  const score = calculateLifeScore(expenses, foods, messages);
  const timeline = createDecisionTimeline(expenses, foods, messages);
  const subscriptions = findSubscriptions(expenses);
  const recurringTotal = subscriptions.reduce(
    (total, subscription) => total + subscription.amount,
    0,
  );
  const weeklyReport = createWeeklyLifeReport(expenses, foods, messages);

  return (
    <>
      <div className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="relative overflow-hidden border-pink-300 bg-pink-50 dark:border-pink-900 dark:bg-card">
          <Flower2 className="absolute -right-4 -top-4 h-24 w-24 rotate-12 text-pink-300/60 dark:text-pink-800/60" />
          <CardHeader>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Daily briefing
            </p>
            <CardTitle className="text-3xl">{briefing.greeting}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Today
            </p>
            <div className="mt-3 space-y-2.5">
              {briefing.bullets.map((bullet) => (
                <p className="flex gap-2 text-sm leading-6" key={bullet}>
                  <Sparkles className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  {bullet}
                </p>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-pink-100 p-4 dark:bg-pink-950">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Recommendation
              </p>
              <p className="mt-2 text-sm font-medium leading-6">
                {briefing.recommendation}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-300 bg-gradient-to-br from-white to-pink-100 dark:border-pink-900 dark:from-card dark:to-pink-950">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                  Life score breakdown
                </p>
                <CardTitle className="mt-2 text-3xl">
                  {score.overall}
                  <span className="text-base text-muted-foreground"> / 100</span>
                </CardTitle>
              </div>
              <div className="grid h-16 w-16 place-items-center rounded-full border-4 border-primary/25 bg-pink-50 text-xl font-bold text-primary dark:bg-pink-950">
                {score.overall}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {score.metrics.map((metric) => (
              <div key={metric.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{metric.label}</span>
                  <span className="font-bold">{metric.value}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-pink-200 dark:bg-pink-900">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <ShouldIWidget expenses={expenses} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" /> Adulting streaks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {streaks.map((streak) => (
              <div
                className="rounded-2xl border border-pink-200 bg-pink-50 p-4 dark:border-pink-900 dark:bg-pink-950"
                key={streak.label}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{streak.label}</p>
                  <p className="text-lg font-bold text-primary">{streak.days}d</p>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {streak.detail}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Life patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {patterns.map((pattern) => (
              <div
                className={cn(
                  "rounded-2xl border p-4",
                  pattern.tone === "warning"
                    ? "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950"
                    : pattern.tone === "positive"
                      ? "border-pink-200 bg-pink-50 dark:border-pink-900 dark:bg-pink-950"
                      : "border-fuchsia-200 bg-fuchsia-50 dark:border-fuchsia-900 dark:bg-fuchsia-950",
                )}
                key={pattern.title}
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  {pattern.title}
                </p>
                <p className="mt-2 text-sm font-semibold leading-6">{pattern.insight}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {pattern.detail}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" /> Decision timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {timeline.map((entry, index) => (
              <div className="relative flex gap-3 pb-4" key={entry.id}>
                {index < timeline.length - 1 && (
                  <span className="absolute left-[15px] top-8 h-full w-px bg-pink-200 dark:bg-pink-900" />
                )}
                <div className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pink-100 text-primary dark:bg-pink-950">
                  {entry.type === "expense" ? (
                    <ReceiptText className="h-4 w-4" />
                  ) : entry.type === "food" ? (
                    <UtensilsCrossed className="h-4 w-4" />
                  ) : (
                    <MessageCircleHeart className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary">
                    {format(new Date(entry.date), "d MMMM")}
                  </p>
                  <p className="mt-1 text-sm font-semibold">{entry.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{entry.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Repeat2 className="h-5 w-5 text-primary" /> Subscription hunter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {subscriptions.map((subscription) => (
                  <div
                    className="flex items-center justify-between rounded-xl bg-pink-50 px-3 py-2 text-sm dark:bg-pink-950"
                    key={subscription.merchant}
                  >
                    <span className="font-medium">{subscription.merchant}</span>
                    <span className="font-bold">{formatCurrency(subscription.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-end justify-between gap-3 border-t border-pink-200 pt-4 dark:border-pink-900">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Monthly recurring cost
                </p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(recurringTotal)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-rose-300 via-pink-500 to-rose-700 text-white shadow-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <WalletCards className="h-5 w-5" /> Weekly life report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-rose-50">
                You spent {formatCurrency(weeklyReport.spent)} this week. Your biggest win:
                {" "}{weeklyReport.biggestWin.toLowerCase()}.
              </p>
              <Button asChild className="mt-5 bg-white text-rose-700 hover:bg-rose-50">
                <a href="/api/reports/weekly">
                  <Download className="h-4 w-4" /> Export beautiful PDF
                </a>
              </Button>
            </CardContent>
          </Card>

          <Link
            className="group flex items-center justify-between gap-4 rounded-2xl border border-pink-300 bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-pink-900"
            href="/coach"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Life coach AI
              </p>
              <p className="mt-2 font-semibold">Talk through a craving, choice, or messy week.</p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-primary transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </>
  );
}
