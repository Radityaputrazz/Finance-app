import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { transactionSchema, transactionFilterSchema } from "@/features/transactions/schemas";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/utils/api";
import {
  getSearchParams,
  parsePagination,
  buildPaginationMeta,
  parseOptionalString,
  parseOptionalDate,
} from "@/lib/api/helpers";

// GET /api/transactions
export async function GET(req: NextRequest) {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const params = getSearchParams(req);
    const { page, limit, skip } = parsePagination(params);

    const rawFilter = {
      type: parseOptionalString(params, "type"),
      categoryId: parseOptionalString(params, "categoryId"),
      walletId: parseOptionalString(params, "walletId"),
      startDate: parseOptionalString(params, "startDate"),
      endDate: parseOptionalString(params, "endDate"),
      search: parseOptionalString(params, "search"),
      page,
      limit,
    };

    const filter = transactionFilterSchema.parse(rawFilter);

    const where = {
      userId: user.id,
      ...(filter.type && filter.type !== "ALL" && { type: filter.type }),
      ...(filter.categoryId && { categoryId: filter.categoryId }),
      ...(filter.walletId && { walletId: filter.walletId }),
      ...(filter.search && {
        description: { contains: filter.search, mode: "insensitive" as const },
      }),
      ...((filter.startDate || filter.endDate) && {
        date: {
          ...(filter.startDate && { gte: new Date(filter.startDate) }),
          ...(filter.endDate && { lte: new Date(filter.endDate) }),
        },
      }),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          wallet: { select: { id: true, name: true, icon: true } },
          toWallet: { select: { id: true, name: true, icon: true } },
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return successResponse({
      transactions,
      meta: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// POST /api/transactions
export async function POST(req: NextRequest) {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const parsed = transactionSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const { amount, type, description, note, date, categoryId, walletId, toWalletId } =
      parsed.data;

    // Verify wallet belongs to user
    const wallet = await prisma.wallet.findFirst({ where: { id: walletId, userId: user.id } });
    if (!wallet) return errorResponse("Dompet tidak ditemukan", 404);

    const transaction = await prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
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
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          wallet: { select: { id: true, name: true, icon: true } },
        },
      });

      if (type === "INCOME") {
        await tx.wallet.update({ where: { id: walletId }, data: { balance: { increment: amount } } });
      } else if (type === "EXPENSE") {
        await tx.wallet.update({ where: { id: walletId }, data: { balance: { decrement: amount } } });
      } else if (type === "TRANSFER" && toWalletId) {
        await tx.wallet.update({ where: { id: walletId }, data: { balance: { decrement: amount } } });
        await tx.wallet.update({ where: { id: toWalletId }, data: { balance: { increment: amount } } });
      }

      return created;
    });

    return successResponse(transaction, 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
