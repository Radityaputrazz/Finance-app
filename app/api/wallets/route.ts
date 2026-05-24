import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { walletSchema } from "@/features/wallets/schemas";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/utils/api";
import { parseDecimal } from "@/lib/utils";

// GET /api/wallets
export async function GET() {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const wallets = await prisma.wallet.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    const totalBalance = wallets.reduce(
      (sum, w) => sum + parseDecimal(w.balance),
      0
    );

    return successResponse({ wallets, totalBalance });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// POST /api/wallets
export async function POST(req: NextRequest) {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const parsed = walletSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const wallet = await prisma.wallet.create({
      data: { ...parsed.data, userId: user.id },
    });

    return successResponse(wallet, 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
