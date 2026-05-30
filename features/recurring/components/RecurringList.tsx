"use client";

import { useState } from "react";
import { Trash2, Pause, Play, RefreshCw } from "lucide-react";
import type { recurringTransaction, Category, Wallet } from "@prisma/client";
import { toggleRecurringAction, deleteRecurringAction, processRecurringTransactionsAction } from "@/features/recurring/actions";
import { EmptyState, Badge } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate, parseDecimal } from "@/lib/utils";
import { showToast } from "@/lib/utils/toast";
import { cn } from "@/lib/utils";

type RecurringWithRelations = recurringTransaction & {
  category: Category | null;
  wallet: Wallet;
};

const FREQ_LABELS: Record<string, string> = {
  DAILY: "Harian",
  WEEKLY: "Mingguan",
  MONTHLY: "Bulanan",
  YEARLY: "Tahunan",
};

interface RecurringListProps {
  items: RecurringWithRelations[];
}

export function RecurringList({ items }: RecurringListProps) {
  const [processing, setProcessing] = useState(false);

  const handleToggle = async (id: string, isActive: boolean) => {
    const result = await toggleRecurringAction(id, !isActive);
    if (result.success) showToast.success(isActive ? "Transaksi dijeda" : "Transaksi diaktifkan");
    else showToast.error(result.error ?? "Terjadi kesalahan");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus transaksi berulang ini?")) return;
    const result = await deleteRecurringAction(id);
    if (result.success) showToast.deleted("Transaksi berulang");
    else showToast.error(result.error ?? "Terjadi kesalahan");
  };

  const handleProcess = async () => {
    setProcessing(true);
    const result = await processRecurringTransactionsAction();
    if (result.success) showToast.success("Transaksi berulang diproses");
    else showToast.error(result.error ?? "Terjadi kesalahan");
    setProcessing(false);
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon="🔄"
        title="Belum ada transaksi berulang"
        description="Tambah transaksi berulang untuk otomatisasi pencatatan rutin."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={handleProcess} loading={processing}>
          <RefreshCw className="w-4 h-4" />
          Proses Sekarang
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm divide-y divide-gray-50 dark:divide-slate-700 overflow-hidden">
        {items.map((item) => (
          <div key={item.id} className={cn("flex items-center gap-3 px-5 py-4 group", !item.isActive && "opacity-50")}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: `${item.category?.color ?? "#64748b"}18` }}
            >
              {item.category?.icon ?? "🔄"}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-800 dark:text-slate-100 truncate">
                  {item.description}
                </p>
                <Badge variant="neutral">{FREQ_LABELS[item.frequency]}</Badge>
                {!item.isActive && <Badge variant="warning">Dijeda</Badge>}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400">
                  Berikutnya: {formatDate(item.nextRunAt)}
                </span>
                {item.endDate && (
                  <span className="text-xs text-gray-400">
                    · Berakhir: {formatDate(item.endDate)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <p className={cn(
                "text-sm font-bold",
                item.type === "INCOME" ? "text-emerald-600" : "text-red-500"
              )}>
                {item.type === "INCOME" ? "+" : "-"}{formatCurrency(parseDecimal(item.amount))}
              </p>
              <div className="hidden group-hover:flex items-center gap-1">
                <button
                  onClick={() => handleToggle(item.id, item.isActive)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                  title={item.isActive ? "Jeda" : "Aktifkan"}
                >
                  {item.isActive
                    ? <Pause className="w-3.5 h-3.5 text-gray-500" />
                    : <Play className="w-3.5 h-3.5 text-emerald-500" />
                  }
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}