import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { APP_USER } from "@/lib/workspace";
import { expenseRuleSchema } from "@/lib/validators";
import { categoryToDb, categoryFromDb } from "@/lib/expenses";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const input = expenseRuleSchema.parse(await request.json());
    const id = (await params).id;
    
    // Verify ownership
    const existingRule = await prisma.expenseRule.findUnique({ where: { id } });
    if (!existingRule || existingRule.userId !== APP_USER.id) {
      return NextResponse.json({ error: "Rule not found." }, { status: 404 });
    }

    const dbRule = await prisma.expenseRule.update({
      where: { id },
      data: {
        merchantSubstring: input.merchantSubstring,
        targetCategory: categoryToDb[input.targetCategory],
      },
    });

    const rule = {
      id: dbRule.id,
      merchantSubstring: dbRule.merchantSubstring,
      targetCategory: categoryFromDb[dbRule.targetCategory],
    };

    return NextResponse.json({ rule });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Please check the rule details." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "Could not update that rule." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const existingRule = await prisma.expenseRule.findUnique({ where: { id } });
    if (!existingRule || existingRule.userId !== APP_USER.id) {
      return NextResponse.json({ error: "Rule not found." }, { status: 404 });
    }

    await prisma.expenseRule.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not delete that rule." }, { status: 500 });
  }
}
