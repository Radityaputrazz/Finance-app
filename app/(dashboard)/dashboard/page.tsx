import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { DashboardSummaryCards } from "@/features/dashboard/components/DashboardSummaryCards";
import { MonthlyBarChart } from "@/features/dashboard/components/MonthlyBarChart";
import { ExpenseDonutChart } from "@/features/dashboard/components/ExpenseDonutChart";
import { DashboardBudgetAlerts } from "@/features/dashboard/components/DashboardBudgetAlerts";
import { useDashboardStats } from "@/features/dashboard/hooks/useDashboardStats";
import { Card } from "@/components/ui";
import { formatCurrency, formatDate, parseDecimal } from "@/lib/utils";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { getUserBudgets } from "@/lib/db/queries";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireAuth();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [transactions, wallets, recentTransactions, budgets] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: user.id, date: { gte: monthStart, lte: monthEnd } },
      include: { category: true, wallet: true },
    }),
    prisma.wallet.findMany({ where: { userId: user.id } }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      include: { category: true, wallet: true },
      orderBy: { date: "desc" },
      take: 8,
    }),
    getUserBudgets(user.id),
  ]);

  const stats = useDashboardStats(transactions as any);

  // Monthly data for last 6 months
  const monthlyData = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i);
      return prisma.transaction.groupBy({
        by: ["type"],
        where: {
          userId: user.id,
          date: { gte: startOfMonth(d), lte: endOfMonth(d) },
        },
        _sum: { amount: true },
      }).then((rows) => ({
        month: format(d, "MMM yy"),
        income: parseDecimal(rows.find((r) => r.type === "INCOME")?._sum.amount ?? 0),
        expense: parseDecimal(rows.find((r) => r.type === "EXPENSE")?._sum.amount ?? 0),
      }));
    })
  );

  // Expense by category
  const expenseByCategory = Object.values(
    transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce<Record<string, { name: string; value: number; color: string; icon: string }>>(
        (acc, t) => {
          const id = t.categoryId;
          acc[id] = acc[id] ?? { name: t.category.name, value: 0, color: t.category.color, icon: t.category.icon };
          acc[id].value += parseDecimal(t.amount);
          return acc;
        },
        {}
      )
  ).sort((a, b) => b.value - a.value);

  const totalWalletBalance = wallets.reduce((s, w) => s + parseDecimal(w.balance), 0);

  return (
    <div className="space-y-6">
      <DashboardBudgetAlerts budgets={budgets} />
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Ringkasan keuangan bulan {format(now, "MMMM yyyy")}
        </p>
      </div>

      {/* Summary cards */}
      <DashboardSummaryCards stats={stats} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MonthlyBarChart data={monthlyData} />
        </div>
        <ExpenseDonutChart data={expenseByCategory} />
      </div>

      {/* Wallets + Recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Wallets */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Dompet Saya</h2>
            <Link href="/wallets" className="text-xs text-emerald-600 flex items-center gap-1 hover:underline">
              Kelola <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {wallets.map((w) => (
              <div key={w.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                  style={{ background: `${w.color}15` }}
                >
                  {w.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{w.name}</p>
                  <p className="text-xs text-gray-400">{w.type}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(w.balance.toString())}</p>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-gray-50 flex justify-between">
              <span className="text-xs text-gray-500 font-medium">Total</span>
              <span className="text-sm font-bold text-emerald-700">{formatCurrency(totalWalletBalance)}</span>
            </div>
          </div>
        </Card>

        {/* Recent transactions */}
        <Card padding="none" className="lg:col-span-2">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">Transaksi Terbaru</h2>
            <Link href="/transactions" className="text-xs text-emerald-600 flex items-center gap-1 hover:underline">
              Semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 px-6 py-3">
                <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-lg shrink-0">
                  {tx.category.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{tx.description}</p>
                  <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
                </div>
                <p className={`text-sm font-bold shrink-0 ${tx.type === "INCOME" ? "text-emerald-600" : tx.type === "EXPENSE" ? "text-red-500" : "text-blue-500"}`}>
                  {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : "↔"}
                  {formatCurrency(tx.amount.toString())}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}