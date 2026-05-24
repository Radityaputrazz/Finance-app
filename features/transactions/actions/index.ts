"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { transactionSchema, type TransactionInput } from "@/features/transactions/schemas";
import type { ActionResult } from "@/lib/db/types";

export async function createTransactionAction(data: TransactionInput): Promise<ActionResult> {
  const user = await requireAuth();

  const parsed = transactionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { amount, type, description, note, date, categoryId, walletId, toWalletId } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          amount,
          type,
          description,
          note,
          date: new Date(date),
          userId: user.id,
          categoryId,
          walletId,
          toWalletId: type === "TRANSFER" ? toWalletId : null,
        },
      });

      // Update wallet balance
      if (type === "INCOME") {
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { increment: amount } },
        });
      } else if (type === "EXPENSE") {
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { decrement: amount } },
        });
      } else if (type === "TRANSFER" && toWalletId) {
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { decrement: amount } },
        });
        await tx.wallet.update({
          where: { id: toWalletId },
          data: { balance: { increment: amount } },
        });
      }
    });

    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/wallets");
    return { success: true };
  } catch (error) {
    console.error("[createTransaction]", error);
    return { success: false, error: "Gagal membuat transaksi" };
  }
}

export async function updateTransactionAction(id: string, data: TransactionInput): Promise<ActionResult> {
  const user = await requireAuth();

  const parsed = transactionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    // Get old transaction to reverse balance
    const old = await prisma.transaction.findFirst({
      where: { id, userId: user.id },
    });
    if (!old) return { success: false, error: "Transaksi tidak ditemukan" };

    await prisma.$transaction(async (tx) => {
      // Reverse old balance
      if (old.type === "INCOME") {
        await tx.wallet.update({ where: { id: old.walletId }, data: { balance: { decrement: old.amount } } });
      } else if (old.type === "EXPENSE") {
        await tx.wallet.update({ where: { id: old.walletId }, data: { balance: { increment: old.amount } } });
      } else if (old.type === "TRANSFER" && old.toWalletId) {
        await tx.wallet.update({ where: { id: old.walletId }, data: { balance: { increment: old.amount } } });
        await tx.wallet.update({ where: { id: old.toWalletId }, data: { balance: { decrement: old.amount } } });
      }

      const { amount, type, description, note, date, categoryId, walletId, toWalletId } = parsed.data;

      // Update transaction
      await tx.transaction.update({
        where: { id },
        data: { amount, type, description, note, date: new Date(date), categoryId, walletId, toWalletId: type === "TRANSFER" ? toWalletId : null },
      });

      // Apply new balance
      if (type === "INCOME") {
        await tx.wallet.update({ where: { id: walletId }, data: { balance: { increment: amount } } });
      } else if (type === "EXPENSE") {
        await tx.wallet.update({ where: { id: walletId }, data: { balance: { decrement: amount } } });
      } else if (type === "TRANSFER" && toWalletId) {
        await tx.wallet.update({ where: { id: walletId }, data: { balance: { decrement: amount } } });
        await tx.wallet.update({ where: { id: toWalletId }, data: { balance: { increment: amount } } });
      }
    });

    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/wallets");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal memperbarui transaksi" };
  }
}

export async function deleteTransactionAction(id: string): Promise<ActionResult> {
  const user = await requireAuth();

  try {
    const tx = await prisma.transaction.findFirst({ where: { id, userId: user.id } });
    if (!tx) return { success: false, error: "Transaksi tidak ditemukan" };

    await prisma.$transaction(async (txClient) => {
      if (tx.type === "INCOME") {
        await txClient.wallet.update({ where: { id: tx.walletId }, data: { balance: { decrement: tx.amount } } });
      } else if (tx.type === "EXPENSE") {
        await txClient.wallet.update({ where: { id: tx.walletId }, data: { balance: { increment: tx.amount } } });
      } else if (tx.type === "TRANSFER" && tx.toWalletId) {
        await txClient.wallet.update({ where: { id: tx.walletId }, data: { balance: { increment: tx.amount } } });
        await txClient.wallet.update({ where: { id: tx.toWalletId }, data: { balance: { decrement: tx.amount } } });
      }
      await txClient.transaction.delete({ where: { id } });
    });

    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/wallets");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus transaksi" };
  }
}