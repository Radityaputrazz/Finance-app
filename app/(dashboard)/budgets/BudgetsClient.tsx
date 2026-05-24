"use client";

import { useState } from "react";
import { Plus, PiggyBank } from "lucide-react";
import type { Category } from "@prisma/client";
import type { BudgetWithRelations } from "@/features/budgets/types";
import { BudgetCard } from "@/features/budgets/components/BudgetCard";
import { BudgetForm } from "@/features/budgets/components/BudgetForm";
import { useBudgetAlerts } from "@/features/budgets/hooks/useBudgetAlerts";
import { EmptyState } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

interface BudgetsClientProps {
  budgets: BudgetWithRelations[];
  categories: Category[];
}

export function BudgetsClient({ budgets, categories }: BudgetsClientProps) {
  const [showForm, setShowForm] = useState(false);
  useBudgetAlerts(budgets);

  const overBudget = budgets.filter((b) => b.isOver);
  const totalLimit = budgets.reduce((s, b) => s + Number(b.amount), 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anggaran</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {budgets.length} anggaran aktif
            {overBudget.length > 0 && (
              <span className="ml-2 text-red-500 font-medium">
                · {overBudget.length} melebihi batas
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Tambah Anggaran
        </Button>
      </div>

      {/* Summary bar */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Total Anggaran",
              value: formatCurrency(totalLimit),
              color: "text-gray-900",
              bg: "bg-gray-50",
            },
            {
              label: "Total Terpakai",
              value: formatCurrency(totalSpent),
              color: "text-red-600",
              bg: "bg-red-50",
            },
            {
              label: "Total Sisa",
              value: formatCurrency(Math.max(0, totalLimit - totalSpent)),
              color: "text-emerald-700",
              bg: "bg-emerald-50",
            },
          ].map((item) => (
            <div key={item.label} className={`${item.bg} rounded-2xl px-4 py-3`}>
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className={`text-base font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Budget cards */}
      {budgets.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="Belum ada anggaran"
          description="Tetapkan batas pengeluaran per kategori untuk mengontrol keuangan Anda."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" />
              Tambah Anggaran
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} />
          ))}
        </div>
      )}

      <BudgetForm
        open={showForm}
        onClose={() => setShowForm(false)}
        categories={categories}
      />
    </>
  );
}