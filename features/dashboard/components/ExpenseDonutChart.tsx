"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

interface ChartItem {
  name: string;
  value: number;
  color: string;
  icon: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700">{payload[0].name}</p>
      <p className="text-gray-500 mt-0.5">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

export function ExpenseDonutChart({ data }: { data: ChartItem[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Pengeluaran per Kategori</h2>
      {data.length === 0 ? (
        <div className="h-44 flex items-center justify-center text-gray-400 text-sm">
          Belum ada data pengeluaran
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2.5 flex-1 min-w-0">
            {data.slice(0, 5).map((entry, i) => (
              <div key={i} className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 truncate">{entry.name}</p>
                  <p className="text-xs font-semibold text-gray-800">
                    {total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}