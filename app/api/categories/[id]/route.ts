import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { categorySchema } from "@/features/categories/schemas";
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

// GET /api/categories/:id
export async function GET(_req: NextRequest, { params }: Params) {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const category = await prisma.category.findFirst({
      where: { id, userId: user.id },
      include: { _count: { select: { transactions: true } } },
    });

    if (!category) return notFoundResponse("Kategori");
    return successResponse(category);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// PATCH /api/categories/:id
export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const existing = await prisma.category.findFirst({ where: { id, userId: user.id } });
    if (!existing) return notFoundResponse("Kategori");

    const updated = await prisma.category.update({
      where: { id },
      data: parsed.data,
    });

    return successResponse(updated);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// DELETE /api/categories/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await params;
    const existing = await prisma.category.findFirst({ where: { id, userId: user.id } });
    if (!existing) return notFoundResponse("Kategori");

    const txCount = await prisma.transaction.count({ where: { categoryId: id } });
    if (txCount > 0) {
      return errorResponse(
        `Tidak bisa hapus kategori yang dipakai di ${txCount} transaksi`,
        409
      );
    }

    await prisma.category.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error) {
    return serverErrorResponse(error);
  }
}