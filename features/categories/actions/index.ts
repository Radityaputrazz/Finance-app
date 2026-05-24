"use server";
import type { ActionResult } from "@/lib/db/types";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { categorySchema, type CategoryInput } from "@/features/categories/schemas";

export async function createCategoryAction(data: CategoryInput) {
  const user = await requireAuth();
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    await prisma.category.create({
      data: { ...parsed.data, userId: user.id },
    });
    revalidatePath("/categories");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal membuat kategori" };
  }
}

export async function updateCategoryAction(id: string, data: CategoryInput) {
  const user = await requireAuth();
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    await prisma.category.updateMany({
      where: { id, userId: user.id },
      data: parsed.data,
    });
    revalidatePath("/categories");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal memperbarui kategori" };
  }
}

export async function deleteCategoryAction(id: string) {
  const user = await requireAuth();

  try {
    const txCount = await prisma.transaction.count({ where: { categoryId: id } });
    if (txCount > 0) return { success: false, error: "Tidak bisa hapus kategori yang sudah dipakai di transaksi" };

    await prisma.category.deleteMany({ where: { id, userId: user.id } });
    revalidatePath("/categories");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus kategori" };
  }
}
