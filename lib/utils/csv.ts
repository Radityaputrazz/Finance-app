import type { TransactionWithRelations } from "@/features/transactions/types";
import { formatCurrency, formatDate, parseDecimal } from "@/lib/utils";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsvRows(headers: string[], rows: string[][]): string {
  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ];
  return lines.join("\n");
}

function downloadCsv(content: string, filename: string) {
  const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportTransactionsCsv(
  transactions: TransactionWithRelations[],
  filename = "transaksi.csv"
) {
  const headers = [
    "Tanggal",
    "Tipe",
    "Deskripsi",
    "Kategori",
    "Dompet",
    "Jumlah (Rp)",
    "Catatan",
  ];

  const rows = transactions.map((t) => [
    formatDate(t.date),
    t.type === "INCOME" ? "Pemasukan" : t.type === "EXPENSE" ? "Pengeluaran" : "Transfer",
    t.description,
    t.category.name,
    t.wallet.name,
    parseDecimal(t.amount).toString(),
    t.note ?? "",
  ]);

  downloadCsv(buildCsvRows(headers, rows), filename);
}

export function exportSummaryCsv(
  transactions: TransactionWithRelations[],
  filename = "ringkasan.csv"
) {
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + parseDecimal(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + parseDecimal(t.amount), 0);

  // Group by category
  const byCategory = Object.values(
    transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce<Record<string, { name: string; amount: number; count: number }>>(
        (acc, t) => {
          acc[t.categoryId] = acc[t.categoryId] ?? {
            name: t.category.name,
            amount: 0,
            count: 0,
          };
          acc[t.categoryId].amount += parseDecimal(t.amount);
          acc[t.categoryId].count += 1;
          return acc;
        },
        {}
      )
  ).sort((a, b) => b.amount - a.amount);

  const headers = ["Kategori", "Jumlah Transaksi", "Total (Rp)", "Persentase (%)"];
  const rows = byCategory.map((c) => [
    c.name,
    c.count.toString(),
    c.amount.toString(),
    totalExpense > 0 ? ((c.amount / totalExpense) * 100).toFixed(1) : "0",
  ]);

  // Add summary rows
  rows.push(["", "", "", ""]);
  rows.push(["TOTAL PEMASUKAN", "", totalIncome.toString(), ""]);
  rows.push(["TOTAL PENGELUARAN", "", totalExpense.toString(), ""]);
  rows.push(["SALDO BERSIH", "", (totalIncome - totalExpense).toString(), ""]);

  downloadCsv(buildCsvRows(headers, rows), filename);
}