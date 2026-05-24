"use client";

import { useBudgetAlerts } from "@/features/budgets/hooks/useBudgetAlerts";
import type { BudgetWithRelations } from "@/features/budgets/types";

export function DashboardBudgetAlerts({ budgets }: { budgets: BudgetWithRelations[] }) {
  useBudgetAlerts(budgets);
  return null;
}