import type { TransactionWithRelations, TransactionSummary } from "@/features/transactions/types";
import { parseDecimal } from "@/lib/utils";

export function useDashboardStats(transactions: TransactionWithRelations[]): TransactionSummary {
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + parseDecimal(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + parseDecimal(t.amount), 0);

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  return {
    totalIncome,
    totalExpense,
    balance,
    savingsRate,
    transactionCount: transactions.length,
  };
}