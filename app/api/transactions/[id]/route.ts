import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { transactionSchema } from "@/features/transactions/schemas";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/utils/api";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/transactions/:id
export async function GET(_req: NextRequest, { params }: Params) {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: user.id },
      include: {
        category: true,
        wallet: true,
        toWallet: true,
      },
    });

    if (!transaction) return notFoundResponse("Transaksi");
    return successResponse(transaction);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// PATCH /api/transactions/:id
export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = transactionSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const old = await prisma.transaction.findFirst({ where: { id, userId: user.id } });
    if (!old) return notFoundResponse("Transaksi");

    const { amount, type, description, note, date, categoryId, walletId, toWalletId } =
      parsed.data;

    const updated = await prisma.$transaction(async (tx) => {
      // Reverse old balance effect
      if (old.type === "INCOME") {
        await tx.wallet.update({ where: { id: old.walletId }, data: { balance: { decrement: old.amount } } });
      } else if (old.type === "EXPENSE") {
        await tx.wallet.update({ where: { id: old.walletId }, data: { balance: { increment: old.amount } } });
      } else if (old.type === "TRANSFER" && old.toWalletId) {
        await tx.wallet.update({ where: { id: old.walletId }, data: { balance: { increment: old.amount } } });
        await tx.wallet.update({ where: { id: old.toWalletId }, data: { balance: { decrement: old.amount } } });
      }

      // Apply new balance effect
      if (type === "INCOME") {
        await tx.wallet.update({ where: { id: walletId }, data: { balance: { increment: amount } } });
      } else if (type === "EXPENSE") {
        await tx.wallet.update({ where: { id: walletId }, data: { balance: { decrement: amount } } });
      } else if (type === "TRANSFER" && toWalletId) {
        await tx.wallet.update({ where: { id: walletId }, data: { balance: { decrement: amount } } });
        await tx.wallet.update({ where: { id: toWalletId }, data: { balance: { increment: amount } } });
      }

      return tx.transaction.update({
        where: { id },
        data: {
          amount,
          type,
          description,
          note,
          date: new Date(date),
          categoryId,
          walletId,
          toWalletId: type === "TRANSFER" ? toWalletId : null,
        },
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          wallet: { select: { id: true, name: true, icon: true } },
        },
      });
    });

    return successResponse(updated);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// DELETE /api/transactions/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const tx = await prisma.transaction.findFirst({ where: { id, userId: user.id } });
    if (!tx) return notFoundResponse("Transaksi");

    await prisma.$transaction(async (client) => {
      // Reverse balance
      if (tx.type === "INCOME") {
        await client.wallet.update({ where: { id: tx.walletId }, data: { balance: { decrement: tx.amount } } });
      } else if (tx.type === "EXPENSE") {
        await client.wallet.update({ where: { id: tx.walletId }, data: { balance: { increment: tx.amount } } });
      } else if (tx.type === "TRANSFER" && tx.toWalletId) {
        await client.wallet.update({ where: { id: tx.walletId }, data: { balance: { increment: tx.amount } } });
        await client.wallet.update({ where: { id: tx.toWalletId }, data: { balance: { decrement: tx.amount } } });
      }

      await client.transaction.delete({ where: { id } });
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return serverErrorResponse(error);
  }
}