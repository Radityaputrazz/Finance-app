"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Filter, Loader2 } from "lucide-react";
import type { Category, Wallet } from "@prisma/client";
import { useInfiniteTransactions } from "@/features/transactions/hooks/useInfiniteTransactions";
import { TransactionForm } from "./TransactionForm";
import { Badge, EmptyState } from "@/components/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { showToast } from "@/lib/utils/toast";
import { deleteTransactionAction } from "@/features/transactions/actions";
import { Pencil, Trash2 } from "lucide-react";
import type { TransactionWithRelations } from "@/features/transactions/types";
import { useQueryClient } from "@tanstack/react-query";

const TYPE_LABELS = {
  INCOME: "Pemasukan",
  EXPENSE: "Pengeluaran",
  TRANSFER: "Transfer",
} as const;

interface InfiniteTransactionListProps {
  categories: Category[];
  wallets: Wallet[];
}

export function InfiniteTransactionList({ categories, wallets }: InfiniteTransactionListProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE" | "TRANSFER">("ALL");
  const [editTx, setEditTx] = useState<TransactionWithRelations | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteTransactions({
    type: typeFilter,
    search: debouncedSearch,
  });

  // Intersection observer for infinite scroll
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allTransactions = data?.pages.flatMap((p) => p.transactions) ?? [];
  const total = data?.pages[0]?.meta.total ?? 0;

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;
    setDeletingId(id);
    const result = await deleteTransactionAction(id);
    if (!result.success) showToast.error(result.error ?? "Terjadi kesalahan");
    else {
      showToast.deleted("Transaksi");
      qc.invalidateQueries({ queryKey: ["transactions-infinite"] });
    }
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
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-slate-600 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          {(["ALL", "INCOME", "EXPENSE", "TRANSFER"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0",
                typeFilter === f
                  ? "bg-emerald-500 text-white"
                  : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-500"
              )}
            >
              {f === "ALL" ? "Semua" : TYPE_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      {!isLoading && (
        <p className="text-xs text-gray-400 mb-3">
          {total} transaksi {debouncedSearch && `untuk "${debouncedSearch}"`}
        </p>
      )}

      {/* List */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 divide-y divide-gray-50 dark:divide-slate-700 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4">
              <Skeleton className="w-10 h-10 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      ) : allTransactions.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Tidak ada transaksi"
          description="Coba ubah filter atau tambah transaksi baru."
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm divide-y divide-gray-50 dark:divide-slate-700 overflow-hidden">
          {allTransactions.map((tx) => (
            <div
              key={tx.id}
              className={cn(
                "flex items-center gap-3 px-4 sm:px-5 py-4 group hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors",
                deletingId === tx.id && "opacity-40"
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-xl shrink-0">
                {tx.category?.icon ?? "↔"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-slate-100 truncate">
                  {tx.description}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-gray-400">{formatDate(new Date(tx.date))}</span>
                  <Badge variant={tx.type === "INCOME" ? "income" : tx.type === "EXPENSE" ? "expense" : "neutral"}>
                    {tx.category?.name ?? "Transfer"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <p className={cn(
                  "text-sm font-bold",
                  tx.type === "INCOME" ? "text-emerald-600" : tx.type === "EXPENSE" ? "text-red-500" : "text-blue-500"
                )}>
                  {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : "↔"}
                  {formatCurrency(tx.amount as unknown as number)}
                </p>
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={() => setEditTx(tx)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg"
                  >
                    <Pencil className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="py-4 flex justify-center">
            {isFetchingNextPage && (
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
            )}
            {!hasNextPage && allTransactions.length > 0 && (
              <p className="text-xs text-gray-400">Semua transaksi sudah ditampilkan</p>
            )}
          </div>
        </div>
      )}

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
