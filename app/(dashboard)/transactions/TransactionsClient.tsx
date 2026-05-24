"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Category, Wallet } from "@prisma/client";
import { TransactionList } from "@/features/transactions/components/TransactionList";
import { TransactionForm } from "@/features/transactions/components/TransactionForm";
import { Button } from "@/components/ui/Button";
import type { TransactionWithRelations } from "@/features/transactions/types";

interface TransactionsClientProps {
  transactions: TransactionWithRelations[];
  categories: Category[];
  wallets: Wallet[];
}

export function TransactionsClient({ transactions, categories, wallets }: TransactionsClientProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
          <p className="text-sm text-gray-500 mt-0.5">{transactions.length} transaksi tersimpan</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Tambah
        </Button>
      </div>

      <TransactionList transactions={transactions} categories={categories} wallets={wallets} />

      <TransactionForm
        open={showForm}
        onClose={() => setShowForm(false)}
        categories={categories}
        wallets={wallets}
      />
    </>
  );
}