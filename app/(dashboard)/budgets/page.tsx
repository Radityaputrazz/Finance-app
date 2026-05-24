import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/session";
import { getUserBudgets, getUserCategories } from "@/lib/db/queries";
import { BudgetsClient } from "./BudgetsClient";
import { serializeArray } from "@/lib/utils/serialize";

export const metadata: Metadata = { title: "Anggaran" };

export default async function BudgetsPage() {
  const user = await requireAuth();

  const [budgets, categories] = await Promise.all([
    getUserBudgets(user.id),
    getUserCategories(user.id, "EXPENSE"),
  ]);

  return (
    <BudgetsClient
      budgets={serializeArray(budgets)}
      categories={serializeArray(categories)}
    />
  );
}