"use server";
import type { ActionResult } from "@/lib/db/types";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { budgetSchema, type BudgetInput } from "@/features/budgets/schemas";

export async function createBudgetAction(data: BudgetInput) {
  const user = await requireAuth();
  const parsed = budgetSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    await prisma.budget.create({
      data: {
        amount: parsed.data.amount,
        period: parsed.data.period,
        categoryId: parsed.data.categoryId,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        userId: user.id,
      },
    });
    revalidatePath("/budgets");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal membuat anggaran" };
  }
}

export async function deleteBudgetAction(id: string) {
  const user = await requireAuth();

  try {
    await prisma.budget.deleteMany({ where: { id, userId: user.id } });
    revalidatePath("/budgets");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus anggaran" };
  }
}
