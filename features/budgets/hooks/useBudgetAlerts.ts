"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { BudgetWithRelations } from "@/features/budgets/types";
import { formatCurrency } from "@/lib/utils";

export function useBudgetAlerts(budgets: BudgetWithRelations[]) {
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const overBudgets = budgets.filter((b) => b.isOver);
    const nearBudgets = budgets.filter(
      (b) => !b.isOver && b.percentage >= 80 && b.percentage < 100
    );

    overBudgets.forEach((b) => {
      if (notifiedRef.current.has(`over-${b.id}`)) return;
      notifiedRef.current.add(`over-${b.id}`);

      toast.error(
        `Anggaran "${b.category?.name ?? ""}" melebihi batas!`,
        {
          description: `Terpakai ${formatCurrency(b.spent)} dari limit ${formatCurrency(b.amount.toString())}`,
          duration: 6000,
          icon: "🚨",
        }
      );
    });

    nearBudgets.forEach((b) => {
      if (notifiedRef.current.has(`near-${b.id}`)) return;
      notifiedRef.current.add(`near-${b.id}`);

      toast.warning(
        `Anggaran "${b.category?.name ?? ""}" hampir habis`,
        {
          description: `${b.percentage.toFixed(0)}% terpakai — sisa ${formatCurrency(b.remaining)}`,
          duration: 5000,
          icon: "⚠️",
        }
      );
    });
  }, [budgets]);
}
