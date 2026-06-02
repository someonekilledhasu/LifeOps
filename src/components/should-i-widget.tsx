"use client";

import { useState } from "react";
import { ArrowRight, CircleHelp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { evaluateShouldI, type ShouldIResult } from "@/lib/premium-insights";
import type { ExpenseRecord } from "@/lib/types";

const prompts = [
  "Should I order biryani?",
  "Should I buy these headphones?",
  "Should I skip class today?",
];

export function ShouldIWidget({ expenses }: { expenses: ExpenseRecord[] }) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<ShouldIResult | null>(null);

  function submit() {
    if (!question.trim()) return;
    setResult(evaluateShouldI(question, expenses));
  }

  return (
    <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-700 p-1 shadow-glow">
      <div className="rounded-[1.8rem] bg-pink-50 p-5 dark:bg-pink-950 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <CircleHelp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
              The Should I? button
            </p>
            <h2 className="mt-1 text-2xl font-bold">Put the decision down for a second.</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              LifeOps checks your budget, recent habits, and the context hiding inside the question.
            </p>
          </div>
        </div>

        <Textarea
          className="mt-5 min-h-24 bg-white text-base dark:bg-pink-900"
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              submit();
            }
          }}
          placeholder="Should I order biryani?"
          value={question}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {prompts.map((prompt) => (
            <button
              className="rounded-full border border-pink-300 bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-primary dark:border-pink-800 dark:bg-pink-900"
              key={prompt}
              onClick={() => setQuestion(prompt)}
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>
        <Button className="mt-4 h-14 w-full text-base" onClick={submit}>
          Help me decide <ArrowRight className="h-5 w-5" />
        </Button>

        {result && (
          <div className="mt-5 rounded-2xl border border-pink-200 bg-white p-5 dark:border-pink-800 dark:bg-pink-900">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                {result.verdict}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {result.confidence}% confidence
              </span>
            </div>
            <h3 className="mt-4 text-xl font-bold">{result.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {result.reasoning}
            </p>
            <div className="mt-4 space-y-2">
              {result.considerations.map((consideration) => (
                <p className="flex gap-2 text-sm" key={consideration}>
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {consideration}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
