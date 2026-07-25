import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { APP_USER } from "@/lib/workspace";
import { getMessages, createMessage } from "@/lib/data";
import { messageInputSchema } from "@/lib/validators";

const saveMessageSchema = messageInputSchema.extend({
  subject: z.string().max(200).default(""),
  body: z.string().min(1).max(6000),
  shortVersion: z.string().min(1).max(3000),
  polished: z.string().min(1).max(6000),
});

export async function GET() {
  return NextResponse.json({ messages: await getMessages(APP_USER.id) });
}

export async function POST(request: Request) {
  try {
    const input = saveMessageSchema.parse(await request.json());
    const message = await createMessage(APP_USER.id, input);
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Please check your draft." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "Could not save your message." }, { status: 500 });
  }
}
