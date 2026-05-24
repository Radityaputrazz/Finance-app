"use client";

import { useState } from "react";
import { Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { exportTransactionsCsv, exportSummaryCsv } from "@/lib/utils/csv";
import { showToast } from "@/lib/utils/toast";
import type { TransactionWithRelations } from "@/features/transactions/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ExportButtonProps {
  transactions: TransactionWithRelations[];
  selectedDate: Date;
}

export function ExportButton({ transactions, selectedDate }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const monthLabel = format(selectedDate, "MMMM_yyyy", { locale: id });

  const handleExportTransactions = () => {
    try {
      exportTransactionsCsv(transactions, `transaksi_${monthLabel}.csv`);
      showToast.success("File CSV berhasil diunduh");
    } catch {
      showToast.error("Gagal mengekspor data");
    }
    setOpen(false);
  };

  const handleExportSummary = () => {
    try {
      exportSummaryCsv(transactions, `ringkasan_${monthLabel}.csv`);
      showToast.success("File ringkasan berhasil diunduh");
    } catch {
      showToast.error("Gagal mengekspor data");
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        onClick={() => setOpen(!open)}
        size="sm"
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-50">
              <p className="text-xs text-gray-400 font-medium">
                {format(selectedDate, "MMMM yyyy", { locale: id })}
              </p>
            </div>
            <button
              onClick={handleExportTransactions}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-base">📄</span>
              <div>
                <p className="text-sm font-medium text-gray-700">Semua Transaksi</p>
                <p className="text-xs text-gray-400">{transactions.length} transaksi</p>
              </div>
            </button>
            <button
              onClick={handleExportSummary}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-base">📊</span>
              <div>
                <p className="text-sm font-medium text-gray-700">Ringkasan per Kategori</p>
                <p className="text-xs text-gray-400">Pengeluaran & pemasukan</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}