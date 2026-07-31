import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { APP_USER } from "@/lib/workspace";
import { expenseRuleSchema } from "@/lib/validators";
import { categoryToDb, categoryFromDb } from "@/lib/expenses";

export async function GET() {
  const rules = await prisma.expenseRule.findMany({
    where: { userId: APP_USER.id },
    orderBy: { createdAt: "desc" },
  });
  
  return NextResponse.json({ 
    rules: rules.map(r => ({
      id: r.id,
      merchantSubstring: r.merchantSubstring,
      targetCategory: categoryFromDb[r.targetCategory],
    }))
  });
}

export async function POST(request: Request) {
  try {
    const input = expenseRuleSchema.parse(await request.json());
    
    // Ensure the mock user exists in the database to satisfy the foreign key constraint
    await prisma.user.upsert({
      where: { id: APP_USER.id },
      update: {},
      create: {
        id: APP_USER.id,
        name: APP_USER.name || "Guest",
        email: APP_USER.email || "guest@lifeops.app",
      },
    });

    const dbRule = await prisma.expenseRule.create({
      data: {
        userId: APP_USER.id,
        merchantSubstring: input.merchantSubstring,
        targetCategory: categoryToDb[input.targetCategory],
      },
    });
    
    const rule = {
      id: dbRule.id,
      merchantSubstring: dbRule.merchantSubstring,
      targetCategory: categoryFromDb[dbRule.targetCategory],
    };
    
    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Please check the rule details." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "Could not add that rule." }, { status: 500 });
  }
}
