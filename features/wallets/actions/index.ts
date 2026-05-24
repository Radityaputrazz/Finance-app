"use server";
import type { ActionResult } from "@/lib/db/types";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { walletSchema, type WalletInput } from "@/features/wallets/schemas";

export async function createWalletAction(data: WalletInput) {
  const user = await requireAuth();
  const parsed = walletSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    await prisma.wallet.create({ data: { ...parsed.data, userId: user.id } });
    revalidatePath("/wallets");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal membuat dompet" };
  }
}

export async function updateWalletAction(id: string, data: Partial<WalletInput>) {
  const user = await requireAuth();

  try {
    await prisma.wallet.updateMany({ where: { id, userId: user.id }, data });
    revalidatePath("/wallets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal memperbarui dompet" };
  }
}

export async function deleteWalletAction(id: string) {
  const user = await requireAuth();

  try {
    const txCount = await prisma.transaction.count({ where: { OR: [{ walletId: id }, { toWalletId: id }] } });
    if (txCount > 0) return { success: false, error: "Tidak bisa hapus dompet yang sudah punya transaksi" };

    await prisma.wallet.deleteMany({ where: { id, userId: user.id } });
    revalidatePath("/wallets");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus dompet" };
  }
}
