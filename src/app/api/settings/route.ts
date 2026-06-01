import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { APP_USER } from "@/lib/workspace";
import { settingsSchema } from "@/lib/validators";

export async function GET() {
  return NextResponse.json({ settings: { name: APP_USER.name, monthlyBudget: 30000, currency: "INR", dietaryPreference: "flexible", favoriteCuisines: ["Indian", "Asian", "Mediterranean"], darkMode: false } });
}

export async function PUT(request: Request) {
  try {
    const input = settingsSchema.parse(await request.json());
    return NextResponse.json({ settings: input });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Please check your preferences." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "Could not save your settings." }, { status: 500 });
  }
}
