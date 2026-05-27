"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { TransactionWithRelations } from "@/features/transactions/types";

interface GlobalSearchProps {
  transactions: TransactionWithRelations[];
}

export function GlobalSearch({ transactions }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  const results = query.length >= 2
    ? transactions
        .filter((t) =>
          t.description.toLowerCase().includes(query.toLowerCase()) ||
          t.category.name.toLowerCase().includes(query.toLowerCase()) ||
          t.note?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8)
    : [];

  const handleSelect = useCallback((tx: TransactionWithRelations) => {
    setOpen(false);
    router.push(`/transactions`);
  }, [router]);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Cari transaksi...</span>
        <kbd className="ml-2 text-[10px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded px-1.5 py-0.5 font-mono">
          ⌘K
        </kbd>
      </button>

      {/* Mobile trigger */}
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
      >
        <Search className="w-4 h-4 text-gray-500 dark:text-slate-400" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-slate-700">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari transaksi, kategori, catatan..."
                className="flex-1 text-sm bg-transparent outline-none text-gray-800 dark:text-slate-100 placeholder:text-gray-400"
              />
              {query && (
                <button onClick={() => setQuery("")}>
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {query.length < 2 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  Ketik minimal 2 karakter untuk mencari
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  Tidak ada hasil untuk &quot;{query}&quot;
                </div>
              ) : (
                <div className="py-2">
                  <p className="px-4 pb-1 text-xs text-gray-400 font-medium">
                    {results.length} hasil ditemukan
                  </p>
                  {results.map((tx) => (
                    <button
                      key={tx.id}
                      onClick={() => handleSelect(tx)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-lg shrink-0">
                        {tx.category.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-slate-100 truncate">
                          {tx.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {tx.category.name} · {formatDate(tx.date)}
                        </p>
                      </div>
                      <p className={cn(
                        "text-sm font-semibold shrink-0",
                        tx.type === "INCOME" ? "text-emerald-600" : "text-red-500"
                      )}>
                        {tx.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(tx.amount as unknown as number)}
                      </p>
                    </button>
                  ))}
                  <div className="px-4 pt-2 pb-1 border-t border-gray-50 dark:border-slate-700 mt-1">
                    <button
                      onClick={() => { router.push("/transactions"); setOpen(false); }}
                      className="flex items-center gap-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Lihat semua di halaman Transaksi
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer shortcuts */}
            <div className="px-4 py-2.5 border-t border-gray-50 dark:border-slate-700 flex items-center gap-4">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <kbd className="text-[10px] bg-gray-100 dark:bg-slate-700 rounded px-1 py-0.5 font-mono">Esc</kbd>
                tutup
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <kbd className="text-[10px] bg-gray-100 dark:bg-slate-700 rounded px-1 py-0.5 font-mono">↵</kbd>
                pilih
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}