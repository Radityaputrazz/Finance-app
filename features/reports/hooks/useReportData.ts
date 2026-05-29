import type { TransactionWithRelations } from "@/features/transactions/types";
import { parseDecimal, formatShortMonth } from "@/lib/utils";
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import { id } from "date-fns/locale";

export type MonthlyReport = {
  month: string;
  income: number;
  expense: number;
  balance: number;
};

export type CategoryReport = {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  amount: number;
  count: number;
  percentage: number;
};

export type DailyReport = {
  date: string;
  label: string;
  income: number;
  expense: number;
};

export function buildMonthlyReport(
  transactions: TransactionWithRelations[],
  months = 6
): MonthlyReport[] {
  const now = new Date();
  const interval = eachMonthOfInterval({
    start: subMonths(startOfMonth(now), months - 1),
    end: endOfMonth(now),
  });

  return interval.map((monthDate) => {
    const key = format(monthDate, "yyyy-MM");
    const monthTxs = transactions.filter(
      (t) => format(new Date(t.date), "yyyy-MM") === key
    );
    const income = monthTxs
      .filter((t) => t.type === "INCOME")
      .reduce((s, t) => s + parseDecimal(t.amount), 0);
    const expense = monthTxs
      .filter((t) => t.type === "EXPENSE")
      .reduce((s, t) => s + parseDecimal(t.amount), 0);

    return {
      month: format(monthDate, "MMM yy", { locale: id }),
      income,
      expense,
      balance: income - expense,
    };
  });
}

export function buildCategoryReport(
  transactions: TransactionWithRelations[],
  type: "INCOME" | "EXPENSE"
): CategoryReport[] {
  const filtered = transactions.filter((t) => t.type === type);
  const total = filtered.reduce((s, t) => s + parseDecimal(t.amount), 0);

  const map = new Map<string, CategoryReport>();

  filtered.forEach((t) => {
    if (!t.category || !t.categoryId) return;
    const catId = t.categoryId as string;
    const existing = map.get(catId) ?? {
      categoryId: catId,
      name: t.category?.name ?? "Transfer",
      icon: t.category?.icon ?? "↔",
      color: t.category?.color ?? "#64748b",
      amount: 0,
      count: 0,
      percentage: 0,
    };
    existing.amount += parseDecimal(t.amount);
    existing.count += 1;
    map.set(catId, existing);
  });

  return Array.from(map.values())
    .map((r) => ({ ...r, percentage: total > 0 ? (r.amount / total) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);
}

export function buildDailyReport(
  transactions: TransactionWithRelations[],
  year: number,
  month: number
): DailyReport[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayTxs = transactions.filter(
      (t) => format(new Date(t.date), "yyyy-MM-dd") === dateStr
    );
    return {
      date: dateStr,
      label: String(day),
      income: dayTxs.filter((t) => t.type === "INCOME").reduce((s, t) => s + parseDecimal(t.amount), 0),
      expense: dayTxs.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + parseDecimal(t.amount), 0),
    };
  });
}
