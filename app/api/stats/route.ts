import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/utils/api";
import { getSearchParams, parseOptionalString } from "@/lib/api/helpers";
import { parseDecimal } from "@/lib/utils";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

// GET /api/stats?month=2025-05  (defaults to current month)
export async function GET(req: NextRequest) {
  const user = await requireAuth().catch(() => null);
  if (!user) return unauthorizedResponse();

  try {
    const params = getSearchParams(req);
    const monthParam = parseOptionalString(params, "month"); // "yyyy-MM"

    const refDate = monthParam ? new Date(`${monthParam}-01`) : new Date();
    const monthStart = startOfMonth(refDate);
    const monthEnd = endOfMonth(refDate);

    const [monthTransactions, wallets, budgets] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: user.id, date: { gte: monthStart, lte: monthEnd } },
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
        },
      }),
      prisma.wallet.findMany({ where: { userId: user.id } }),
      prisma.budget.findMany({
        where: { userId: user.id },
        include: { category: true },
      }),
    ]);

    // Monthly summary
    const totalIncome = monthTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((s, t) => s + parseDecimal(t.amount), 0);

    const totalExpense = monthTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((s, t) => s + parseDecimal(t.amount), 0);

    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0
      ? ((totalIncome - totalExpense) / totalIncome) * 100
      : 0;

    // Total wallet balance
    const totalWalletBalance = wallets.reduce(
      (s, w) => s + parseDecimal(w.balance),
      0
    );

    // Expense by category (for donut chart)
    const expenseByCategory = Object.values(
      monthTransactions
        .filter((t) => t.type === "EXPENSE")
        .reduce<Record<string, { name: string; icon: string; color: string; amount: number }>>(
          (acc, t) => {
            acc[t.categoryId] = acc[t.categoryId] ?? {
              name: t.category.name,
              icon: t.category.icon,
              color: t.category.color,
              amount: 0,
            };
            acc[t.categoryId].amount += parseDecimal(t.amount);
            return acc;
          },
          {}
        )
    ).sort((a, b) => b.amount - a.amount);

    // Last 6 months trend
    const monthlyTrend = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(refDate, 5 - i);
        return prisma.transaction
          .groupBy({
            by: ["type"],
            where: {
              userId: user.id,
              date: { gte: startOfMonth(d), lte: endOfMonth(d) },
            },
            _sum: { amount: true },
          })
          .then((rows) => ({
            month: format(d, "MMM yy"),
            income: parseDecimal(
              rows.find((r) => r.type === "INCOME")?._sum.amount ?? 0
            ),
            expense: parseDecimal(
              rows.find((r) => r.type === "EXPENSE")?._sum.amount ?? 0
            ),
          }));
      })
    );

    // Budget progress
    const budgetProgress = await Promise.all(
      budgets.map(async (budget) => {
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
        return {
          id: budget.id,
          categoryName: budget.category.name,
          categoryIcon: budget.category.icon,
          limit,
          spent,
          percentage: limit > 0 ? (spent / limit) * 100 : 0,
          isOver: spent > limit,
        };
      })
    );

    return successResponse({
      month: format(refDate, "yyyy-MM"),
      summary: { totalIncome, totalExpense, balance, savingsRate },
      wallets: {
        list: wallets,
        totalBalance: totalWalletBalance,
      },
      expenseByCategory,
      monthlyTrend,
      budgetProgress,
      transactionCount: monthTransactions.length,
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
