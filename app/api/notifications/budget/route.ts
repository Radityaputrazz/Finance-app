import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { sendBudgetAlertEmail } from "@/lib/email/sendEmail";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/utils/api";
import { parseDecimal } from "@/lib/utils";
import { withRateLimit } from "@/lib/api/withRateLimit";

async function postHandler(req: NextRequest) {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    // Get user email
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true, name: true },
    });
    if (!dbUser?.email) return successResponse({ skipped: true });

    // Get all active budgets with spending
    const budgets = await prisma.budget.findMany({
      where: { userId: user.id },
      include: { category: true },
    });

    const alerts: string[] = [];

    for (const budget of budgets) {
      const agg = await prisma.transaction.aggregate({
        where: {
          userId: user.id,
          categoryId: budget.categoryId,
          type: "EXPENSE",
          date: { gte: budget.startDate, lte: budget.endDate },
        },
        _sum: { amount: true },
      });

      const spent = parseDecimal(agg._sum.amount ?? 0);
      const limit = parseDecimal(budget.amount);
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;

      // Send alert if over 80% or over limit
      if (percentage >= 80) {
        await sendBudgetAlertEmail({
          to: dbUser.email,
          userName: dbUser.name ?? "Pengguna",
          categoryName: budget.category.name,
          categoryIcon: budget.category.icon,
          spent,
          limit,
          percentage,
          isOver: spent > limit,
        });
        alerts.push(budget.category.name);
      }
    }

    return successResponse({ alerts });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export const POST = withRateLimit(postHandler, "write");