"use client";

import { useState } from "react";
import { Flower2, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { CoachAnswer } from "@/lib/ai";

type ConversationItem =
  | { id: string; role: "user"; message: string }
  | { id: string; role: "coach"; message: string; nextSteps?: string[] };

const starters = [
  "I'm craving food but I'm trying to save money.",
  "Should I buy something that has been sitting in my cart?",
  "I feel overwhelmed. Help me choose one useful thing.",
];

export function LifeCoach({ name }: { name: string }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<ConversationItem[]>([
    {
      id: "welcome",
      role: "coach",
      message: `Hi ${name}. Tell me what is on your mind. I can use your spending habits and recent patterns to help you make the next choice feel lighter.`,
    },
  ]);

  async function send() {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setConversation((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", message: trimmed },
    ]);
    setQuestion("");
    setLoading(true);

    const response = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: trimmed }),
    });
    const data = (await response.json()) as {
      answer?: CoachAnswer;
      error?: string;
    };
    setLoading(false);

    if (!response.ok || !data.answer) {
      toast.error(data.error ?? "Your coach could not reply just yet.");
      return;
    }

    setConversation((current) => [
      ...current,
      {
        id: `coach-${Date.now()}`,
        role: "coach",
        message: data.answer!.message,
        nextSteps: data.answer!.nextSteps,
      },
    ]);
  }

  return (
    <div className="mx-auto max-w-5xl p-5 sm:p-7 lg:p-9">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-300 via-pink-500 to-fuchsia-700 p-6 text-white shadow-glow sm:p-8">
        <Flower2 className="absolute -right-6 -top-7 h-32 w-32 rotate-12 text-pink-200/50" />
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-50">
          Life coach AI
        </p>
        <h1 className="mt-2 max-w-xl text-3xl font-bold sm:text-4xl">
          Talk it through with someone who already knows the patterns.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-rose-50">
          Budget context, food habits, and your recent decisions come together in one gentle place.
        </p>
      </div>

      <Card className="mt-5 overflow-hidden">
        <CardContent className="p-0">
          <div className="max-h-[520px] min-h-[390px] space-y-4 overflow-y-auto bg-pink-50 p-4 dark:bg-pink-950 sm:p-6">
            {conversation.map((item) => (
              <div
                className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
                key={item.id}
              >
                <div
                  className={
                    item.role === "user"
                      ? "max-w-[85%] rounded-[1.4rem] rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground"
                      : "max-w-[88%] rounded-[1.4rem] rounded-bl-md border border-pink-200 bg-white px-4 py-3 text-sm leading-6 dark:border-pink-800 dark:bg-card"
                  }
                >
                  <p>{item.message}</p>
                  {"nextSteps" in item && item.nextSteps?.length ? (
                    <div className="mt-3 space-y-2 border-t border-pink-200 pt-3 dark:border-pink-800">
                      {item.nextSteps.map((step) => (
                        <p className="flex gap-2 text-xs" key={step}>
                          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          {step}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-[1.4rem] rounded-bl-md border border-pink-200 bg-white px-4 py-3 text-sm dark:border-pink-800 dark:bg-card">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Looking at your patterns...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-pink-200 bg-card p-4 dark:border-pink-900 sm:p-5">
            <div className="mb-3 flex flex-wrap gap-2">
              {starters.map((starter) => (
                <button
                  className="rounded-full border border-pink-300 px-3 py-1.5 text-left text-xs text-muted-foreground transition hover:border-primary hover:text-primary dark:border-pink-800"
                  key={starter}
                  onClick={() => setQuestion(starter)}
                  type="button"
                >
                  {starter}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <Textarea
                className="min-h-20 flex-1"
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                    void send();
                  }
                }}
                placeholder="Tell your coach what feels tricky..."
                value={question}
              />
              <Button
                aria-label="Send message"
                className="h-12 w-12 shrink-0 p-0"
                disabled={loading || !question.trim()}
                onClick={() => void send()}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
