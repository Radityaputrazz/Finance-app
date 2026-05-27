"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Category, Wallet } from "@prisma/client";
import { InfiniteTransactionList } from "@/features/transactions/components/InfiniteTransactionList";
import { TransactionForm } from "@/features/transactions/components/TransactionForm";
import { Button } from "@/components/ui/Button";

interface TransactionsClientProps {
  categories: Category[];
  wallets: Wallet[];
}

export function TransactionsClient({ categories, wallets }: TransactionsClientProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Transaksi</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Semua riwayat transaksi Anda
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Tambah
        </Button>
      </div>

      <InfiniteTransactionList categories={categories} wallets={wallets} />

      <TransactionForm
        open={showForm}
        onClose={() => setShowForm(false)}
        categories={categories}
        wallets={wallets}
      />
    </>
  );
}