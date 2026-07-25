import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { APP_USER } from "@/lib/workspace";
import { updateExpense, deleteExpense } from "@/lib/data";
import { expenseSchema } from "@/lib/validators";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const input = expenseSchema.parse(await request.json());
    const expense = await updateExpense(APP_USER.id, id, input);
    return NextResponse.json({ expense });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Please check the expense details." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "Could not update that expense." }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: Context) {
  try {
    const { id } = await context.params;
    await deleteExpense(APP_USER.id, id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not delete that expense." }, { status: 500 });
  }
}
