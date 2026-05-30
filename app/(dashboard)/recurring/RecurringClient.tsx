"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Category, Wallet, RecurringTransaction } from "@prisma/client";
import { RecurringList } from "@/features/recurring/components/RecurringList";
import { RecurringForm } from "@/features/recurring/components/RecurringForm";
import { Button } from "@/components/ui/Button";

type RecurringWithRelations = RecurringTransaction & {
  category: Category | null;
  wallet: Wallet;
};

interface RecurringClientProps {
  items: RecurringWithRelations[];
  categories: Category[];
  wallets: Wallet[];
}

export function RecurringClient({ items, categories, wallets }: RecurringClientProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Transaksi Berulang
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            {items.length} transaksi otomatis aktif
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Tambah
        </Button>
      </div>

      <RecurringList items={items} />

      <RecurringForm
        open={showForm}
        onClose={() => setShowForm(false)}
        categories={categories}
        wallets={wallets}
      />
    </>
  );
}