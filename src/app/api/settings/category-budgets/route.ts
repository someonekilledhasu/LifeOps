import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { APP_USER } from "@/lib/workspace";

const categoryBudgetSchema = z.object({
  category: z.enum([
    "FOOD",
    "SHOPPING",
    "TRANSPORT",
    "BILLS",
    "SUBSCRIPTIONS",
    "EDUCATION",
    "ENTERTAINMENT",
    "HEALTH",
    "TRAVEL",
    "OTHER",
  ]),
  limit: z.number().min(0),
});

const categoryBudgetsSchema = z.array(categoryBudgetSchema);

export async function GET() {
  try {
    const categoryBudgets = await prisma.categoryBudget.findMany({
      where: { userId: APP_USER.id },
    });
    return NextResponse.json({ categoryBudgets });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch category budgets" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const input = categoryBudgetsSchema.parse(await request.json());

    await prisma.categoryBudget.deleteMany({
      where: {
        userId: APP_USER.id,
        category: {
          notIn: input.map((b) => b.category),
        },
      },
    });

    const promises = input.map((budget) =>
      prisma.categoryBudget.upsert({
        where: {
          userId_category: {
            userId: APP_USER.id,
            category: budget.category,
          },
        },
        update: {
          limit: budget.limit,
        },
        create: {
          userId: APP_USER.id,
          category: budget.category,
          limit: budget.limit,
        },
      })
    );

    await Promise.all(promises);

    const categoryBudgets = await prisma.categoryBudget.findMany({
      where: { userId: APP_USER.id },
    });

    return NextResponse.json({ categoryBudgets });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update category budgets" }, { status: 400 });
  }
}
