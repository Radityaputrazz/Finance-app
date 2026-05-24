"use client";

import { useState } from "react";
import { Pencil, Trash2, Search, Filter } from "lucide-react";
import type { Category, Wallet } from "@prisma/client";
import type { TransactionWithRelations } from "@/features/transactions/types";
import { deleteTransactionAction } from "@/features/transactions/actions";
import { TransactionForm } from "./TransactionForm";
import { Badge, EmptyState } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { showToast } from "@/lib/utils/toast";
import { isActionError } from "@/lib/utils/action";

interface TransactionListProps {
  transactions: TransactionWithRelations[];
  categories: Category[];
  wallets: Wallet[];
}

const TYPE_COLORS = {
  INCOME: "income",
  EXPENSE: "expense",
  TRANSFER: "neutral",
} as const;

const TYPE_LABELS = {
  INCOME: "Pemasukan",
  EXPENSE: "Pengeluaran",
  TRANSFER: "Transfer",
} as const;

export function TransactionList({ transactions, categories, wallets }: TransactionListProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE" | "TRANSFER">("ALL");
  const [editTx, setEditTx] = useState<TransactionWithRelations | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = transactions.filter((t) => {
    const matchType = typeFilter === "ALL" || t.type === typeFilter;
    const matchSearch = !search || t.description.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;
    setDeletingId(id);
    const result = await deleteTransactionAction(id);
    if (result?.error) showToast.error(result.error);
    else showToast.deleted("Transaksi");
    setDeletingId(null);
  };

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          {(["ALL", "INCOME", "EXPENSE", "TRANSFER"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap",
                typeFilter === f
                  ? "bg-emerald-500 text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              )}
            >
              {f === "ALL" ? "Semua" : TYPE_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Tidak ada transaksi"
          description="Coba ubah filter atau tambah transaksi baru."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
          {filtered.map((tx) => (
            <div
              key={tx.id}
              className={cn(
                "flex items-center gap-3 px-4 sm:px-5 py-4 group hover:bg-gray-50/50 transition-colors",
                deletingId === tx.id && "opacity-50"
              )}
            >
              {/* Category icon */}
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl shrink-0">
                {tx.category.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{tx.description}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-gray-400">{formatDate(tx.date)}</span>
                  <span className="text-gray-200">·</span>
                  <Badge variant={TYPE_COLORS[tx.type]}>{tx.category.name}</Badge>
                  <span className="text-gray-200 hidden sm:inline">·</span>
                  <span className="hidden sm:inline text-xs text-gray-400">{tx.wallet.icon} {tx.wallet.name}</span>
                </div>
                {tx.note && <p className="text-xs text-gray-400 mt-0.5 truncate">{tx.note}</p>}
              </div>

              {/* Amount + actions */}
              <div className="flex items-center gap-2 shrink-0">
                <p className={cn(
                  "text-sm font-bold",
                  tx.type === "INCOME" ? "text-emerald-600" : tx.type === "EXPENSE" ? "text-red-500" : "text-blue-500"
                )}>
                  {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : "↔"}{formatCurrency(tx.amount.toString())}
                </p>
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={() => setEditTx(tx)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editTx && (
        <TransactionForm
          open={!!editTx}
          onClose={() => setEditTx(null)}
          categories={categories}
          wallets={wallets}
          transaction={editTx}
        />
      )}
    </>
  );
}