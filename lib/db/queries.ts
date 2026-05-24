import { prisma } from "@/lib/db/prisma";
import {
  transactionWithRelations,
  categoryWithCount,
  budgetWithCategory,
  type BudgetWithRelations,
} from "@/lib/db/types";
import { parseDecimal } from "@/lib/utils";
import { startOfMonth, endOfMonth } from "date-fns";

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function getUserTransactions(
  userId: string,
  opts: {
    limit?: number;
    startDate?: Date;
    endDate?: Date;
    type?: "INCOME" | "EXPENSE" | "TRANSFER";
    categoryId?: string;
    walletId?: string;
  } = {}
) {
  return prisma.transaction.findMany({
    where: {
      userId,
      ...(opts.type && { type: opts.type }),
      ...(opts.categoryId && { categoryId: opts.categoryId }),
      ...(opts.walletId && { walletId: opts.walletId }),
      ...((opts.startDate || opts.endDate) && {
        date: {
          ...(opts.startDate && { gte: opts.startDate }),
          ...(opts.endDate && { lte: opts.endDate }),
        },
      }),
    },
    include: transactionWithRelations,
    orderBy: { date: "desc" },
    ...(opts.limit && { take: opts.limit }),
  });
}

export async function getMonthTransactions(userId: string, date = new Date()) {
  return getUserTransactions(userId, {
    startDate: startOfMonth(date),
    endDate: endOfMonth(date),
  });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getUserCategories(
  userId: string,
  type?: "INCOME" | "EXPENSE"
) {
  return prisma.category.findMany({
    where: { userId, ...(type && { type }) },
    include: categoryWithCount,
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}

// ─── Wallets ──────────────────────────────────────────────────────────────────

export async function getUserWallets(userId: string) {
  return prisma.wallet.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getTotalWalletBalance(userId: string): Promise<number> {
  const wallets = await getUserWallets(userId);
  return wallets.reduce((sum, w) => sum + parseDecimal(w.balance), 0);
}

// ─── Budgets ──────────────────────────────────────────────────────────────────

export async function getUserBudgets(userId: string): Promise<BudgetWithRelations[]> {
  const budgets = await prisma.budget.findMany({
    where: { userId },
    include: budgetWithCategory,
    orderBy: { createdAt: "desc" },
  });

  return Promise.all(
    budgets.map(async (budget) => {
      const agg = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: "EXPENSE",
          date: { gte: budget.startDate, lte: budget.endDate },
        },
        _sum: { amount: true },
      });

      const spent = parseDecimal(agg._sum.amount ?? 0);
      const limit = parseDecimal(budget.amount);

      return {
        ...budget,
        spent,
        percentage: limit > 0 ? (spent / limit) * 100 : 0,
        remaining: limit - spent,
        isOver: spent > limit,
      };
    })
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getTransactionSummary(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  const [income, expense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "INCOME", date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = parseDecimal(income._sum.amount ?? 0);
  const totalExpense = parseDecimal(expense._sum.amount ?? 0);
  const balance = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    balance,
    savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
  };
}