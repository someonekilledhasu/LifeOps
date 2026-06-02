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

type CoachContext = {
  weeklyFoodSpend: number;
  weeklyFoodBudget: number;
  eatingOutCount: number;
  subscriptionsTotal: number;
  strongestPattern: string;
};

export type CoachAnswer = {
  message: string;
  nextSteps: string[];
};

export async function coachReply(
  question: string,
  context: CoachContext,
): Promise<{ answer: CoachAnswer; source: "ai" | "fallback" }> {
  const generated = await requestJson<CoachAnswer>(
    `You are the warm, practical LifeOps coach. Answer the user's question with a clear recommendation using their actual context. Avoid judgment and keep the response under 120 words.
User question: ${JSON.stringify(question)}
LifeOps context: ${JSON.stringify(context)}
Return {"message":"helpful response","nextSteps":["short action","short action","short action"]}.`,
  );

  if (generated?.message && generated.nextSteps?.length) {
    return { answer: generated, source: "ai" };
  }

  const normalized = question.toLowerCase();
  const foodBudgetDifference = context.weeklyFoodSpend - context.weeklyFoodBudget;

  if (/crav|food|order|hungry|biryani|pizza|swiggy|zomato/.test(normalized)) {
    return {
      source: "fallback",
      answer: {
        message:
          foodBudgetDifference > 0
            ? `Your craving is real, and your food budget is already ₹${foodBudgetDifference.toLocaleString("en-IN")} over plan. Give yourself a satisfying homemade option first. You are not saying no forever, just protecting tomorrow-you from a choice that may not feel worth it.`
            : `You have room in your food budget, but you have already eaten out ${context.eatingOutCount} time${context.eatingOutCount === 1 ? "" : "s"} this week. Make this a deliberate treat or try one comforting homemade option first.`,
        nextSteps: [
          "Drink water and wait 15 minutes.",
          "Choose the fastest comforting meal already at home.",
          "If you still order, set a clear spending cap.",
        ],
      },
    };
  }

  if (/buy|shopping|cart|headphone|amazon|spend/.test(normalized)) {
    return {
      source: "fallback",
      answer: {
        message:
          "Put the item on a 48-hour wishlist. The point is not to deny yourself nice things; it is to make sure the purchase still feels useful after the excitement settles.",
        nextSteps: [
          "Write down what problem the item solves.",
          "Compare its price with one current goal.",
          "Revisit the cart after two sleeps.",
        ],
      },
    };
  }

  return {
    source: "fallback",
    answer: {
      message: `Start with the smallest honest next step. One useful pattern I can already see is this: ${context.strongestPattern.toLowerCase()} You do not need to solve the entire week tonight.`,
      nextSteps: [
        "Name the one decision that would make tomorrow easier.",
        "Choose an action that takes under 15 minutes.",
        "Check in again after you complete it.",
      ],
    },
  };
}
