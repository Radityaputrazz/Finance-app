"use client";

import { useState, useEffect } from "react";
import { ArrowLeftRight, RefreshCw } from "lucide-react";
import { SUPPORTED_CURRENCIES, formatInCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";

export function CurrencyConverter() {
  const [amount, setAmount] = useState("1000000");
  const [from, setFrom] = useState("IDR");
  const [to, setTo] = useState("USD");
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchRate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/currency?from=${from}&to=${to}`);
      const json = await res.json();
      setRate(json.data?.rate ?? null);
      setLastUpdated(new Date().toLocaleTimeString("id-ID"));
    } catch {
      setRate(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRate();
  }, [from, to]);

  const swapCurrencies = () => {
    setFrom(to);
    setTo(from);
  };

  const numAmount = parseFloat(amount) || 0;
  const converted = rate ? numAmount * rate : null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-200">
          Konversi Mata Uang
        </h2>
        <button
          onClick={fetchRate}
          className={cn(
            "p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors",
            loading && "animate-spin"
          )}
          title="Refresh kurs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      {/* Amount input */}
      <div className="mb-3">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
          placeholder="Masukkan jumlah"
        />
      </div>

      {/* Currency selectors */}
      <div className="flex items-center gap-2 mb-4">
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
        >
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>

        <button
          onClick={swapCurrencies}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors shrink-0"
        >
          <ArrowLeftRight className="w-4 h-4 text-gray-400" />
        </button>

        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
        >
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Result */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
        {loading ? (
          <div className="flex items-center justify-center py-2">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : converted !== null ? (
          <>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">
              {formatInCurrency(numAmount, from)} =
            </p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {formatInCurrency(converted, to)}
            </p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-400">
                1 {from} = {rate?.toFixed(4)} {to}
              </p>
              {lastUpdated && (
                <p className="text-xs text-gray-400">
                  Update: {lastUpdated}
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400 text-center py-2">
            Gagal mengambil kurs. Cek koneksi internet.
          </p>
        )}
      </div>
    </div>
  );
}