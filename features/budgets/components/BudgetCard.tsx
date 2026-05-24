"use client";

import { Trash2, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import type { BudgetWithRelations } from "@/features/budgets/types";
import { deleteBudgetAction } from "@/features/budgets/actions";
import { ProgressBar } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { showToast } from "@/lib/utils/toast";
import { useState } from "react";

interface BudgetCardProps {
  budget: BudgetWithRelations;
}

export function BudgetCard({ budget }: BudgetCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Hapus anggaran "${budget.category.name}"?`)) return;
    setDeleting(true);
    const result = await deleteBudgetAction(budget.id);
    if (result?.error) {
      showToast.error(result.error);
      setDeleting(false);
    } else {
      showToast.deleted("Anggaran");
    }
  };

  const statusColor =
    budget.percentage >= 100
      ? "#ef4444"
      : budget.percentage >= 80
      ? "#f59e0b"
      : "#10b981";

  const StatusIcon =
    budget.percentage >= 100
      ? AlertTriangle
      : budget.percentage >= 80
      ? TrendingUp
      : CheckCircle;

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm p-5 group transition-opacity",
        deleting && "opacity-40"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: `${budget.category.color}18` }}
          >
            {budget.category.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{budget.category.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDate(budget.startDate)} – {formatDate(budget.endDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusIcon
            className="w-4 h-4"
            style={{ color: statusColor }}
          />
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar
        value={budget.spent}
        max={Number(budget.amount)}
        color={statusColor}
        className="mb-3"
      />

      {/* Stats */}
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="text-gray-400">Terpakai </span>
          <span className="font-semibold" style={{ color: statusColor }}>
            {formatCurrency(budget.spent)}
          </span>
        </div>
        <div
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${statusColor}15`, color: statusColor }}
        >
          {budget.percentage.toFixed(0)}%
        </div>
        <div>
          <span className="text-gray-400">Limit </span>
          <span className="font-semibold text-gray-700">
            {formatCurrency(budget.amount.toString())}
          </span>
        </div>
      </div>

      {/* Over budget warning */}
      {budget.isOver && (
        <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-xs text-red-600 font-medium">
            Melebihi anggaran sebesar {formatCurrency(Math.abs(budget.remaining))}
          </p>
        </div>
      )}

      {/* Remaining (if not over) */}
      {!budget.isOver && (
        <p className="mt-2 text-xs text-gray-400 text-right">
          Sisa:{" "}
          <span className="font-medium text-emerald-600">
            {formatCurrency(budget.remaining)}
          </span>
        </p>
      )}
    </div>
  );
}