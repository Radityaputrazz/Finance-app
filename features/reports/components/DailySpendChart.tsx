"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import type { DailyReport } from "@/features/reports/hooks/useReportData";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-500 mb-1">Hari ke-{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-3">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-semibold text-gray-800">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function DailySpendChart({ data, monthLabel }: { data: DailyReport[]; monthLabel: string }) {
  return (
    <Card>
      <h2 className="text-sm font-semibold text-gray-700 mb-1">Transaksi Harian</h2>
      <p className="text-xs text-gray-400 mb-4">{monthLabel}</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f87171" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v === 0 ? "0" : `${(v / 1e6).toFixed(1)}jt`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area dataKey="income" name="Pemasukan" stroke="#10b981" strokeWidth={1.5} fill="url(#incomeGrad)" dot={false} />
          <Area dataKey="expense" name="Pengeluaran" stroke="#f87171" strokeWidth={1.5} fill="url(#expenseGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}