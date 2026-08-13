import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { APP_USER } from "@/lib/workspace";
import { getSettings, upsertSettings } from "@/lib/data";
import { settingsSchema } from "@/lib/validators";

export async function GET() {
  const settings = await getSettings(APP_USER.id);
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  try {
    const input = settingsSchema.parse(await request.json());
    const settings = await upsertSettings(APP_USER.id, input);
    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Please check your preferences." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "Could not save your settings." }, { status: 500 });
  }
}
