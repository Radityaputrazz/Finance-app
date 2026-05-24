import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { format } from "date-fns";
import type { Wallet } from "@prisma/client";

export interface StatsResponse {
  month: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    savingsRate: number;
  };
  wallets: {
    list: Wallet[];
    totalBalance: number;
  };
  expenseByCategory: {
    name: string;
    icon: string;
    color: string;
    amount: number;
  }[];
  monthlyTrend: {
    month: string;
    income: number;
    expense: number;
  }[];
  budgetProgress: {
    id: string;
    categoryName: string;
    categoryIcon: string;
    limit: number;
    spent: number;
    percentage: number;
    isOver: boolean;
  }[];
  transactionCount: number;
}

export function useStats(date?: Date) {
  const month = date ? format(date, "yyyy-MM") : format(new Date(), "yyyy-MM");

  return useQuery({
    queryKey: ["stats", month],
    queryFn: () => apiClient.get<StatsResponse>(`/api/stats?month=${month}`),
    staleTime: 1000 * 30, // 30 seconds — stats change frequently
  });
}