"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChefHat, Clock3, HeartPulse, IndianRupee, Loader2, Sparkles, Star, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { foodInputSchema } from "@/lib/validators";
import { formatCurrency } from "@/lib/utils";
import type { FoodDecisionRecord, FoodSuggestion } from "@/lib/types";
import type { z } from "zod";

type FormInput = z.input<typeof foodInputSchema>;
type FormValues = z.output<typeof foodInputSchema>;

export function FoodDecider({ initialHistory }: { initialHistory: FoodDecisionRecord[] }) {
  const [suggestions, setSuggestions] = useState<FoodSuggestion[]>([]);
  const [source, setSource] = useState<"ai" | "fallback" | null>(null);
  const [history, setHistory] = useState(initialHistory);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(foodInputSchema),
    defaultValues: {
      budget: 500,
      diet: "Vegetarian",
      cuisine: "",
      mood: "Something comforting",
      timeMinutes: 30,
      mode: "Order in",
      health: "Balanced",
    },
  });

  async function submit(values: FormValues) {
    const response = await fetch("/api/food/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ?? "Could not generate food ideas.");
      return;
    }
    setSuggestions(data.suggestions);
    setSource(data.source);
    setHistory((current) => [data.decision, ...current].slice(0, 12));
    toast.success("A few good options are ready.");
  }

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-7 lg:p-9">
      <div><p className="text-sm font-semibold text-primary">Food decider</p><h1 className="mt-1 text-3xl font-bold tracking-tight">What should I eat?</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Tell LifeOps what kind of day you are having. You will get a short list of realistic answers, not a hundred tabs to open.</p></div>
      <div className="mt-7 grid gap-5 lg:grid-cols-[0.86fr_1.14fr]">
        <Card>
          <CardHeader><CardTitle>Set the vibe</CardTitle></CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(submit)}>
              <Field label="Budget" error={errors.budget?.message}><Input type="number" min={1} {...register("budget")} /></Field>
              <Field label="Diet" error={errors.diet?.message}><Select {...register("diet")}><option>Vegetarian</option><option>Non-vegetarian</option><option>Vegan</option></Select></Field>
              <Field label="Cuisine preference" error={errors.cuisine?.message}><Input placeholder="Anything, Indian, Asian..." {...register("cuisine")} /></Field>
              <Field label="Mood" error={errors.mood?.message}><Input placeholder="Comforting, spicy, light..." {...register("mood")} /></Field>
              <Field label="Time available" error={errors.timeMinutes?.message}><Select {...register("timeMinutes")}><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">1 hour</option></Select></Field>
              <Field label="Plan" error={errors.mode?.message}><Select {...register("mode")}><option>Order in</option><option>Cook</option><option>Eat out</option></Select></Field>
              <Field label="Health preference" error={errors.health?.message}><Select {...register("health")}><option>Comfort first</option><option>Balanced</option><option>High protein</option><option>Light</option></Select></Field>
              <div className="flex items-end"><Button className="w-full" size="lg" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4" /> Find my food</>}</Button></div>
            </form>
          </CardContent>
        </Card>

        <div>
          {suggestions.length ? (
            <div>
              <div className="flex items-center justify-between"><h2 className="font-bold">Your best options</h2>{source === "fallback" && <Badge>Smart fallback suggestions</Badge>}</div>
              <div className="mt-3 grid gap-3">
                {suggestions.map((suggestion) => <Suggestion key={suggestion.title} suggestion={suggestion} />)}
              </div>
            </div>
          ) : (
            <Card className="flex min-h-[350px] items-center justify-center border-dashed bg-pink-50 dark:bg-pink-950">
              <CardContent className="max-w-sm p-8 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-pink-500/10 text-pink-600"><UtensilsCrossed className="h-7 w-7" /></div><h2 className="mt-5 font-bold">Your shortlist will land here</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">A few useful details on the left, then LifeOps will narrow dinner down to something you can actually act on.</p></CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-bold">Previous decisions</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {history.slice(0, 6).map((decision) => (
            <Card key={decision.id}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{format(new Date(decision.createdAt), "d MMM, h:mm a")} · {decision.mode}</p><p className="mt-2 font-semibold">{decision.suggestions[0]?.title}</p><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{decision.mood}</p></CardContent></Card>
          ))}
          {!history.length && <p className="text-sm text-muted-foreground">Your solved food decisions will collect here.</p>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}

function Suggestion({ suggestion }: { suggestion: FoodSuggestion }) {
  return (
    <Card className="transition hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div><h3 className="font-semibold">{suggestion.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{suggestion.whyItFits}</p></div>
          <Badge className="shrink-0 bg-secondary text-secondary-foreground"><IndianRupee className="mr-1 h-3 w-3" />{formatCurrency(suggestion.estimatedCost).replace("₹", "")}</Badge>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><HeartPulse className="h-3.5 w-3.5 text-rose-500" /> Health {suggestion.healthiness}/5</span>
          <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-pink-500" /> Budget fit {suggestion.budgetFit}/5</span>
          <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5 text-fuchsia-500" /> Quick next step</span>
        </div>
        <p className="mt-3 rounded-lg bg-pink-100 p-2.5 text-xs leading-5 dark:bg-pink-950">{suggestion.nextStep}</p>
      </CardContent>
    </Card>
  );
}
