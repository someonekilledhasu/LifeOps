import { z } from "zod";
import { expenseCategories } from "@/lib/types";

export const expenseSchema = z.object({
  date: z.string().min(1),
  merchant: z.string().trim().min(2).max(100),
  amount: z.coerce.number().positive().max(10_000_000),
  currency: z.string().trim().length(3).optional(),
  category: z.enum(expenseCategories),
  notes: z.string().trim().max(240).optional().default(""),
});

export const foodInputSchema = z.object({
  budget: z.coerce.number().positive().max(100_000),
  diet: z.enum(["Vegetarian", "Non-vegetarian", "Vegan"]),
  cuisine: z.string().trim().max(80).optional().default(""),
  mood: z.string().trim().min(2).max(80),
  timeMinutes: z.coerce.number().int().min(5).max(240),
  mode: z.enum(["Order in", "Cook", "Eat out"]),
  health: z.enum(["Comfort first", "Balanced", "High protein", "Light"]),
});

export const messageInputSchema = z.object({
  situation: z.string().trim().min(2).max(100),
  tone: z.enum(["Formal", "Friendly", "Casual", "Polite", "Confident"]),
  recipient: z.string().trim().min(2).max(100),
  context: z.string().trim().min(10).max(1600),
});

export const settingsSchema = z.object({
  name: z.string().trim().min(2).max(80),
  monthlyBudget: z.coerce.number().positive().max(100_000_000),
  currency: z.enum(["INR", "USD", "EUR", "GBP", "SGD"]),
  dietaryPreference: z.enum(["flexible", "vegetarian", "non-vegetarian", "vegan"]),
  favoriteCuisines: z.array(z.string().trim().min(1).max(40)).max(8),
  darkMode: z.boolean(),
});

export const coachInputSchema = z.object({
  question: z.string().trim().min(3).max(800),
});
