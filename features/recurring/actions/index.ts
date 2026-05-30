"use server";

import { revalidatePath } from "next/cache";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { recurringSchema, type RecurringInput } from "@/features/recurring/schemas";
import type { ActionResult } from "@/lib/db/types";

function getNextRunDate(frequency: string, from: Date): Date {
  switch (frequency) {
    case "DAILY":   return addDays(from, 1);
    case "WEEKLY":  return addWeeks(from, 1);
    case "YEARLY":  return addYears(from, 1);
    case "MONTHLY":
    default:        return addMonths(from, 1);
  }
}

export async function createRecurringAction(data: RecurringInput): Promise<ActionResult> {
  const user = await requireAuth();
  const parsed = recurringSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const startDate = new Date(parsed.data.startDate);
    await prisma.recurringTransaction.create({
      data: {
        amount: parsed.data.amount,
        type: parsed.data.type,
        description: parsed.data.description,
        note: parsed.data.note,
        frequency: parsed.data.frequency,
        startDate,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        nextRunAt: startDate,
        categoryId: parsed.data.categoryId,
        walletId: parsed.data.walletId,
        userId: user.id,
      },
    });
    revalidatePath("/transactions");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal membuat transaksi berulang" };
  }
}

export async function toggleRecurringAction(id: string, isActive: boolean): Promise<ActionResult> {
  const user = await requireAuth();
  try {
    await prisma.recurringTransaction.updateMany({
      where: { id, userId: user.id },
      data: { isActive },
    });
    revalidatePath("/transactions");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal mengubah status" };
  }
}

export async function deleteRecurringAction(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  try {
    await prisma.recurringTransaction.deleteMany({ where: { id, userId: user.id } });
    revalidatePath("/transactions");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus transaksi berulang" };
  }
}

// Called by cron job or manually to process due recurring transactions
export async function processRecurringTransactionsAction(): Promise<ActionResult> {
  const user = await requireAuth();
  const now = new Date();

  try {
    const dues = await prisma.recurringTransaction.findMany({
      where: {
        userId: user.id,
        isActive: true,
        nextRunAt: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
    });

    for (const recurring of dues) {
      await prisma.$transaction(async (tx) => {
        // Create the actual transaction
        await tx.transaction.create({
          data: {
            amount: recurring.amount,
            type: recurring.type,
            description: recurring.description,
            note: recurring.note,
            date: now,
            userId: recurring.userId,
            categoryId: recurring.categoryId,
            walletId: recurring.walletId,
          },
        });

        // Update wallet balance
        if (recurring.type === "INCOME") {
          await tx.wallet.update({
            where: { id: recurring.walletId },
            data: { balance: { increment: recurring.amount } },
          });
        } else {
          await tx.wallet.update({
            where: { id: recurring.walletId },
            data: { balance: { decrement: recurring.amount } },
          });
        }

        // Update recurring — set lastRunAt and nextRunAt
        const nextRun = getNextRunDate(recurring.frequency, now);
        await tx.recurringTransaction.update({
          where: { id: recurring.id },
          data: {
            lastRunAt: now,
            nextRunAt: nextRun,
          },
        });
      });
    }

    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/wallets");
    return { success: true, data: dues.length as any };
  } catch {
    return { success: false, error: "Gagal memproses transaksi berulang" };
  }
}