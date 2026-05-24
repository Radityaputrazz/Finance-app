"use client";

import { Card } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import type { CategoryReport } from "@/features/reports/hooks/useReportData";

interface CategoryBreakdownProps {
  data: CategoryReport[];
  type: "INCOME" | "EXPENSE";
}

export function CategoryBreakdown({ data, type }: CategoryBreakdownProps) {
  const title = type === "INCOME" ? "Sumber Pemasukan" : "Pengeluaran per Kategori";

  if (data.length === 0) {
    return (
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4">{title}</h2>
        <p className="text-sm text-gray-400 text-center py-8">Belum ada data</p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-sm font-semibold text-gray-700 mb-4">{title}</h2>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.categoryId}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{item.icon}</span>
              <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{item.name}</span>
              <span className="text-xs text-gray-400">{item.count}x</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(item.amount)}
              </span>
              <span
                className="text-xs font-medium w-10 text-right"
                style={{ color: item.color }}
              >
                {item.percentage.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.percentage}%`,
                  background: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}