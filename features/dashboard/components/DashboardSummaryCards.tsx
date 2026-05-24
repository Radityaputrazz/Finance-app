import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import { Card } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { TransactionSummary } from "@/features/transactions/types";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
}

function StatCard({ label, value, icon, iconBg, iconColor, valueColor }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4">
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
        <p className={cn("text-lg font-bold truncate", valueColor ?? "text-gray-900")}>{value}</p>
      </div>
    </Card>
  );
}

export function DashboardSummaryCards({ stats }: { stats: TransactionSummary }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Pemasukan"
        value={formatCurrency(stats.totalIncome)}
        icon={<TrendingUp className="w-5 h-5" />}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
        valueColor="text-emerald-700"
      />
      <StatCard
        label="Total Pengeluaran"
        value={formatCurrency(stats.totalExpense)}
        icon={<TrendingDown className="w-5 h-5" />}
        iconBg="bg-red-50"
        iconColor="text-red-500"
        valueColor="text-red-600"
      />
      <StatCard
        label="Saldo Bersih"
        value={formatCurrency(stats.balance)}
        icon={<Wallet className="w-5 h-5" />}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        valueColor={stats.balance >= 0 ? "text-blue-700" : "text-red-600"}
      />
      <StatCard
        label="Tingkat Tabungan"
        value={`${stats.savingsRate.toFixed(1)}%`}
        icon={<PiggyBank className="w-5 h-5" />}
        iconBg="bg-violet-50"
        iconColor="text-violet-600"
        valueColor="text-violet-700"
      />
    </div>
  );
}