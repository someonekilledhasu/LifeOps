import type { FoodSuggestion, MessageResult } from "@/lib/types";

function cleanJson(text: string) {
  return text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}

async function requestJson<T>(prompt: string): Promise<T | null> {
  try {
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Return valid JSON only. Do not wrap it in markdown." },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      });
      if (!response.ok) throw new Error("OpenAI request failed");
      const json = await response.json();
      return JSON.parse(cleanJson(json.choices[0].message.content)) as T;
    }

    if (process.env.GEMINI_API_KEY) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: `${prompt}\nReturn valid JSON only.` }] }] }),
        },
      );
      if (!response.ok) throw new Error("Gemini request failed");
      const json = await response.json();
      return JSON.parse(cleanJson(json.candidates[0].content.parts[0].text)) as T;
    }
  } catch (error) {
    console.error("AI provider error:", error);
  }
  return null;
}

type FoodInput = {
  budget: number;
  diet: string;
  cuisine?: string;
  mood: string;
  timeMinutes: number;
  mode: string;
  health: string;
};

export async function foodSuggestions(input: FoodInput): Promise<{ suggestions: FoodSuggestion[]; source: "ai" | "fallback" }> {
  const generated = await requestJson<{ suggestions: FoodSuggestion[] }>(
    `Suggest 4 practical meals for this user: ${JSON.stringify(input)}.
Return {"suggestions":[{"title":"...","estimatedCost":number,"whyItFits":"...","healthiness":number from 1 to 5,"budgetFit":number from 1 to 5,"nextStep":"brief recipe or ordering tip"}]}.`,
  );
  if (generated?.suggestions?.length) return { suggestions: generated.suggestions.slice(0, 5), source: "ai" };

  const vegetarian = input.diet !== "Non-vegetarian";
  const fallback: FoodSuggestion[] = [
    {
      title: vegetarian ? "Paneer tikka grain bowl" : "Chicken tikka grain bowl",
      estimatedCost: Math.min(input.budget, 340),
      whyItFits: "A filling comfort meal with enough vegetables to stay balanced.",
      healthiness: 4,
      budgetFit: 5,
      nextStep: input.mode === "Cook" ? "Layer rice, tikka, cucumber and a quick yogurt dressing." : "Order a bowl with extra salad and dressing on the side.",
    },
    {
      title: input.diet === "Vegan" ? "Tofu chilli garlic noodles" : "Chilli garlic noodles with vegetables",
      estimatedCost: Math.min(input.budget, 240),
      whyItFits: "Fast, satisfying and easy to tune up or down depending on your mood.",
      healthiness: 3,
      budgetFit: 5,
      nextStep: "Add a protein, request extra vegetables and keep the sauce light.",
    },
    {
      title: "Mediterranean hummus plate",
      estimatedCost: Math.min(input.budget, 310),
      whyItFits: "Fresh, flexible and a good pick when you want something lighter.",
      healthiness: 5,
      budgetFit: 4,
      nextStep: "Pair hummus with falafel, salad and one pita. Add soup if you are extra hungry.",
    },
    {
      title: input.diet === "Non-vegetarian" ? "Egg bhurji wrap" : "Masala chickpea wrap",
      estimatedCost: Math.min(input.budget, 190),
      whyItFits: "A quick, wallet-friendly answer for a busy day.",
      healthiness: 4,
      budgetFit: 5,
      nextStep: "Add crunchy vegetables and mint chutney, then toast the wrap for two minutes.",
    },
  ];
  return { suggestions: fallback, source: "fallback" };
}

type MessageInput = {
  situation: string;
  tone: string;
  recipient: string;
  context: string;
};

export async function generatedMessage(input: MessageInput): Promise<{ message: MessageResult; source: "ai" | "fallback" }> {
  const generated = await requestJson<MessageResult>(
    `Write an everyday message with these requirements: ${JSON.stringify(input)}.
Return {"subject":"optional useful subject","body":"ready-to-send message","shortVersion":"shorter alternative","polished":"slightly more polished alternative"}.`,
  );
  if (generated?.body && generated.shortVersion && generated.polished) return { message: generated, source: "ai" };

  const greeting = `Hi ${input.recipient},`;
  const body = `${greeting}\n\nI hope you are doing well. ${input.context} I wanted to reach out directly and would appreciate your help with this. Please let me know what works best from your side.\n\nThank you for your time.`;
  return {
    source: "fallback",
    message: {
      subject: `${input.situation}: quick note`,
      body,
      shortVersion: `${greeting}\n\n${input.context} Please let me know what works best. Thank you.`,
      polished: `${greeting}\n\nI hope your week is going well. ${input.context} I would be grateful for your guidance and am happy to work around what is most convenient for you.\n\nThank you for your consideration.`,
    },
  };
}
