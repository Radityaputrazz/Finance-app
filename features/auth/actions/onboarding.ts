"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function markOnboardedAction() {
  const user = await requireAuth();

  await prisma.user.update({
    where: { id: user.id },
    data: { onboarded: true },
  });

  revalidatePath("/dashboard");
}