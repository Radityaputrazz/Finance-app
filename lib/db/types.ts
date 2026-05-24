import type { Prisma } from "@prisma/client";

// ─── Transaction ─────────────────────────────────────────────────────────────

export const transactionWithRelations = {
  category: { select: { id: true, name: true, icon: true, color: true, type: true } },
  wallet: { select: { id: true, name: true, icon: true, color: true } },
  toWallet: { select: { id: true, name: true, icon: true, color: true } },
} satisfies Prisma.TransactionInclude;

export type TransactionWithRelations = Prisma.TransactionGetPayload<{
  include: typeof transactionWithRelations;
}>;

export const transactionWithFullRelations = {
  category: true,
  wallet: true,
  toWallet: true,
} satisfies Prisma.TransactionInclude;

export type TransactionWithFullRelations = Prisma.TransactionGetPayload<{
  include: typeof transactionWithFullRelations;
}>;

// ─── Category ─────────────────────────────────────────────────────────────────

export const categoryWithCount = {
  _count: { select: { transactions: true } },
} satisfies Prisma.CategoryInclude;

export type CategoryWithCount = Prisma.CategoryGetPayload<{
  include: typeof categoryWithCount;
}>;

// ─── Budget ───────────────────────────────────────────────────────────────────

export const budgetWithCategory = {
  category: true,
} satisfies Prisma.BudgetInclude;

export type BudgetWithCategory = Prisma.BudgetGetPayload<{
  include: typeof budgetWithCategory;
}>;

export type BudgetWithRelations = BudgetWithCategory & {
  spent: number;
  percentage: number;
  remaining: number;
  isOver: boolean;
};

// ─── Wallet ───────────────────────────────────────────────────────────────────

export const walletWithCounts = {
  _count: {
    select: {
      transactionsFrom: true,
      transactionsTo: true,
    },
  },
} satisfies Prisma.WalletInclude;

export type WalletWithCounts = Prisma.WalletGetPayload<{
  include: typeof walletWithCounts;
}>;

// ─── Utility types ────────────────────────────────────────────────────────────

export type PaginatedResult<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export type TransactionQueryFilter = {
  userId: string;
  type?: "INCOME" | "EXPENSE" | "TRANSFER";
  categoryId?: string;
  walletId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
};