import type { Transaction, Category, Wallet } from "@prisma/client";

export type {
  TransactionWithRelations,
  TransactionWithFullRelations,
} from "@/lib/db/types";

export type TransactionSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  transactionCount: number;
};