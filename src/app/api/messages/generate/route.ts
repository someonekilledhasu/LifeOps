import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { generatedMessage } from "@/lib/ai";
import { messageInputSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const input = messageInputSchema.parse(await request.json());
    return NextResponse.json(await generatedMessage(input));
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Please add a little more context." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "Could not generate your message." }, { status: 500 });
  }
}
