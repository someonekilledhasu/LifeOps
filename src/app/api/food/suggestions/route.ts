import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { APP_USER } from "@/lib/workspace";
import { foodSuggestions } from "@/lib/ai";
import { createFoodDecision } from "@/lib/data";
import { foodInputSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const input = foodInputSchema.parse(await request.json());
    const result = await foodSuggestions(input);
    const decision = await createFoodDecision(APP_USER.id, { ...input, suggestions: result.suggestions });
    return NextResponse.json({
      ...result,
      decision,
    });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Please check your food preferences." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "Could not generate food suggestions." }, { status: 500 });
  }
}
