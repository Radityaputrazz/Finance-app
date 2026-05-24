"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import type { MonthlyReport } from "@/features/reports/hooks/useReportData";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs min-w-40">
      <p className="font-semibold text-gray-600 mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex justify-between gap-4">
          <span className="text-gray-500">{entry.name}</span>
          <span className="font-semibold" style={{ color: entry.color }}>
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function MonthlyTrendChart({ data }: { data: MonthlyReport[] }) {
  return (
    <Card>
      <h2 className="text-sm font-semibold text-gray-700 mb-1">Tren 6 Bulan Terakhir</h2>
      <p className="text-xs text-gray-400 mb-4">Pemasukan, pengeluaran, dan saldo bersih</p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1e6).toFixed(0)}jt`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <ReferenceLine y={0} stroke="#e5e7eb" />
          <Line dataKey="income" name="Pemasukan" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: "#10b981" }} activeDot={{ r: 6 }} />
          <Line dataKey="expense" name="Pengeluaran" stroke="#f87171" strokeWidth={2} dot={{ r: 4, fill: "#f87171" }} activeDot={{ r: 6 }} />
          <Line dataKey="balance" name="Saldo" stroke="#60a5fa" strokeWidth={2} strokeDasharray="4 2" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}