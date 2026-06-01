import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { expenseSchema } from "@/lib/validators";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const input = expenseSchema.parse(await request.json());
    return NextResponse.json({ expense: { id, ...input, date: new Date(input.date).toISOString(), source: "manual" } });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Please check the expense details." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "Could not update that expense." }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: Context) {
  await context.params;
  return NextResponse.json({ deleted: true });
}
