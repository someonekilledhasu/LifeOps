import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { APP_USER } from "@/lib/workspace";
import { foodSuggestions } from "@/lib/ai";
import { foodInputSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const input = foodInputSchema.parse(await request.json());
    const result = await foodSuggestions(input);
    const createdAt = new Date();
    const id = `${APP_USER.id}-food-${Date.now()}`;
    return NextResponse.json({
      ...result,
      decision: { id, createdAt: createdAt.toISOString(), mood: input.mood, mode: input.mode, suggestions: result.suggestions },
    });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Please check your food preferences." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "Could not generate food suggestions." }, { status: 500 });
  }
}
