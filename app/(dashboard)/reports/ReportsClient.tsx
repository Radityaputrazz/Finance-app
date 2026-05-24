"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, subMonths, addMonths } from "date-fns";
import { id } from "date-fns/locale";
import type { TransactionWithRelations } from "@/features/transactions/types";
import {
  buildMonthlyReport,
  buildCategoryReport,
  buildDailyReport,
} from "@/features/reports/hooks/useReportData";
import { MonthlyTrendChart } from "@/features/reports/components/MonthlyTrendChart";
import { CategoryBreakdown } from "@/features/reports/components/CategoryBreakdown";
import { DailySpendChart } from "@/features/reports/components/DailySpendChart";
import { Card } from "@/components/ui";
import { ExportButton } from "@/features/reports/components/ExportButton";
import { formatCurrency, parseDecimal } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ReportsClientProps {
  transactions: TransactionWithRelations[];
}

export function ReportsClient({ transactions }: ReportsClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth() + 1;
  const monthLabel = format(selectedDate, "MMMM yyyy", { locale: id });

  // Filter transactions for selected month
  const monthTxs = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth;
    });
  }, [transactions, selectedYear, selectedMonth]);

  const monthlyReport = useMemo(() => buildMonthlyReport(transactions, 6), [transactions]);
  const expenseReport = useMemo(() => buildCategoryReport(monthTxs, "EXPENSE"), [monthTxs]);
  const incomeReport = useMemo(() => buildCategoryReport(monthTxs, "INCOME"), [monthTxs]);
  const dailyReport = useMemo(
    () => buildDailyReport(monthTxs, selectedYear, selectedMonth),
    [monthTxs, selectedYear, selectedMonth]
  );

  const monthIncome = monthTxs.filter((t) => t.type === "INCOME").reduce((s, t) => s + parseDecimal(t.amount), 0);
  const monthExpense = monthTxs.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + parseDecimal(t.amount), 0);
  const monthBalance = monthIncome - monthExpense;
  const savingsRate = monthIncome > 0 ? ((monthIncome - monthExpense) / monthIncome) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header with month navigator */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analisis keuangan Anda</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton transactions={monthTxs} selectedDate={selectedDate} />
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setSelectedDate((d) => subMonths(d, 1))}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <span className="text-sm font-medium text-gray-700 px-2 min-w-[120px] text-center">
            {monthLabel}
          </span>
          <button
            onClick={() => setSelectedDate((d) => addMonths(d, 1))}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={selectedDate >= new Date()}
          >
            <ChevronRight className="w-4 h-4 text-gray-500 disabled:opacity-30" />
          </button>
          </div>
        </div>
      </div>

      {/* Month summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pemasukan", value: monthIncome, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Pengeluaran", value: monthExpense, color: "text-red-600", bg: "bg-red-50" },
          {
            label: "Saldo Bersih",
            value: monthBalance,
            color: monthBalance >= 0 ? "text-blue-700" : "text-red-600",
            bg: "bg-blue-50",
          },
          {
            label: "Tingkat Tabungan",
            value: null,
            display: `${savingsRate.toFixed(1)}%`,
            color: "text-violet-700",
            bg: "bg-violet-50",
          },
        ].map((item) => (
          <div key={item.label} className={cn("rounded-2xl px-4 py-3", item.bg)}>
            <p className="text-xs text-gray-500 mb-1">{item.label}</p>
            <p className={cn("text-base font-bold", item.color)}>
              {item.display ?? formatCurrency(item.value!)}
            </p>
          </div>
        ))}
      </div>

      {/* 6-month trend */}
      <MonthlyTrendChart data={monthlyReport} />

      {/* Daily chart */}
      <DailySpendChart data={dailyReport} monthLabel={monthLabel} />

      {/* Category breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoryBreakdown data={expenseReport} type="EXPENSE" />
        <CategoryBreakdown data={incomeReport} type="INCOME" />
      </div>

      {/* Summary table */}
      {monthTxs.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Ringkasan {monthLabel} ({monthTxs.length} transaksi)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 text-xs font-medium text-gray-500">Tanggal</th>
                  <th className="text-left pb-3 text-xs font-medium text-gray-500">Deskripsi</th>
                  <th className="text-left pb-3 text-xs font-medium text-gray-500 hidden sm:table-cell">Kategori</th>
                  <th className="text-right pb-3 text-xs font-medium text-gray-500">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {monthTxs.slice(0, 10).map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 text-xs text-gray-400">
                      {format(new Date(tx.date), "d MMM")}
                    </td>
                    <td className="py-2.5 text-gray-700 max-w-[180px] truncate pr-4">
                      {tx.description}
                    </td>
                    <td className="py-2.5 hidden sm:table-cell">
                      <span className="text-xs bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5 text-gray-500">
                        {tx.category.icon} {tx.category.name}
                      </span>
                    </td>
                    <td className={cn(
                      "py-2.5 text-right font-semibold text-sm",
                      tx.type === "INCOME" ? "text-emerald-600" : "text-red-500"
                    )}>
                      {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(parseDecimal(tx.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {monthTxs.length > 10 && (
              <p className="text-xs text-gray-400 text-center mt-3">
                +{monthTxs.length - 10} transaksi lainnya — lihat di halaman Transaksi
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}