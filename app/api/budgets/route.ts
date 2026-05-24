import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { budgetSchema } from "@/features/budgets/schemas";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/utils/api";
import { parseDecimal } from "@/lib/utils";

// GET /api/budgets
export async function GET() {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    // Enrich with spent amounts
    const enriched = await Promise.all(
      budgets.map(async (budget) => {
        const agg = await prisma.transaction.aggregate({
          where: {
            userId: user.id,
            categoryId: budget.categoryId,
            type: "EXPENSE",
            date: { gte: budget.startDate, lte: budget.endDate },
          },
          _sum: { amount: true },
        });

        const spent = parseDecimal(agg._sum.amount ?? 0);
        const limit = parseDecimal(budget.amount);
        const percentage = limit > 0 ? (spent / limit) * 100 : 0;

        return {
          ...budget,
          spent,
          percentage,
          remaining: limit - spent,
          isOver: spent > limit,
        };
      })
    );

    return successResponse(enriched);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// POST /api/budgets
export async function POST(req: NextRequest) {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const parsed = budgetSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: { id: parsed.data.categoryId, userId: user.id },
    });
    if (!category) return errorResponse("Kategori tidak ditemukan", 404);

    const budget = await prisma.budget.create({
      data: {
        amount: parsed.data.amount,
        period: parsed.data.period,
        categoryId: parsed.data.categoryId,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        userId: user.id,
      },
      include: { category: true },
    });

    return successResponse(budget, 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
