import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { walletSchema } from "@/features/wallets/schemas";
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

// GET /api/wallets/:id
export async function GET(_req: NextRequest, { params }: Params) {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const wallet = await prisma.wallet.findFirst({
      where: { id, userId: user.id },
    });

    if (!wallet) return notFoundResponse("Dompet");
    return successResponse(wallet);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// PATCH /api/wallets/:id
export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await req.json();

    // Allow partial update - only validate fields present in body
    const parsed = walletSchema.partial().safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const existing = await prisma.wallet.findFirst({ where: { id, userId: user.id } });
    if (!existing) return notFoundResponse("Dompet");

    const updated = await prisma.wallet.update({
      where: { id },
      data: parsed.data,
    });

    return successResponse(updated);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// DELETE /api/wallets/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const existing = await prisma.wallet.findFirst({ where: { id, userId: user.id } });
    if (!existing) return notFoundResponse("Dompet");

    const txCount = await prisma.transaction.count({
      where: { OR: [{ walletId: id }, { toWalletId: id }] },
    });

    if (txCount > 0) {
      return errorResponse(
        `Tidak bisa hapus dompet yang memiliki ${txCount} transaksi`,
        409
      );
    }

    await prisma.wallet.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error) {
    return serverErrorResponse(error);
  }
}