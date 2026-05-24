import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { budgetSchema } from "@/features/budgets/schemas";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/utils/api";
import { parseDecimal } from "@/lib/utils";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/budgets/:id
export async function GET(_req: NextRequest, { params }: Params) {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const budget = await prisma.budget.findFirst({
      where: { id, userId: user.id },
      include: { category: true },
    });

    if (!budget) return notFoundResponse("Anggaran");

    // Enrich with spent amount
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

    return successResponse({
      ...budget,
      spent,
      percentage: limit > 0 ? (spent / limit) * 100 : 0,
      remaining: limit - spent,
      isOver: spent > limit,
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// PATCH /api/budgets/:id
export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = budgetSchema.partial().safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const existing = await prisma.budget.findFirst({ where: { id, userId: user.id } });
    if (!existing) return notFoundResponse("Anggaran");

    const updated = await prisma.budget.update({
      where: { id },
      data: {
        ...(parsed.data.amount !== undefined && { amount: parsed.data.amount }),
        ...(parsed.data.period && { period: parsed.data.period }),
        ...(parsed.data.categoryId && { categoryId: parsed.data.categoryId }),
        ...(parsed.data.startDate && { startDate: new Date(parsed.data.startDate) }),
        ...(parsed.data.endDate && { endDate: new Date(parsed.data.endDate) }),
      },
      include: { category: true },
    });

    return successResponse(updated);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// DELETE /api/budgets/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const existing = await prisma.budget.findFirst({ where: { id, userId: user.id } });
    if (!existing) return notFoundResponse("Anggaran");

    await prisma.budget.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error) {
    return serverErrorResponse(error);
  }
}