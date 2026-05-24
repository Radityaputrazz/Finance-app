import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { categorySchema } from "@/features/categories/schemas";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/utils/api";
import { getSearchParams, parseOptionalString } from "@/lib/api/helpers";

// GET /api/categories?type=EXPENSE
export async function GET(req: NextRequest) {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const params = getSearchParams(req);
    const type = parseOptionalString(params, "type") as "INCOME" | "EXPENSE" | undefined;

    const categories = await prisma.category.findMany({
      where: {
        userId: user.id,
        ...(type && { type }),
      },
      include: { _count: { select: { transactions: true } } },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    return successResponse(categories);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// POST /api/categories
export async function POST(req: NextRequest) {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const category = await prisma.category.create({
      data: { ...parsed.data, userId: user.id },
    });

    return successResponse(category, 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
