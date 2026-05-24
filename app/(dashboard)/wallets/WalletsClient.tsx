"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import type { Wallet } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { walletSchema, type WalletInput } from "@/features/wallets/schemas";
import { createWalletAction, deleteWalletAction } from "@/features/wallets/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { WALLET_TYPES } from "@/config/app";
import { showToast } from "@/lib/utils/toast";
import { isActionError } from "@/lib/utils/action";

const WALLET_ICONS = ["💵", "💳", "🏦", "📱", "💰", "🏧", "📈", "💹"];
const WALLET_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"];

export function WalletsClient({ wallets }: { wallets: Wallet[] }) {
  const [showForm, setShowForm] = useState(false);
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<WalletInput>({
    resolver: zodResolver(walletSchema),
    defaultValues: { type: "CASH", balance: 0, currency: "IDR", color: "#10b981", icon: "💵" },
  });

  const selectedColor = watch("color");
  const selectedIcon = watch("icon");

  const onSubmit = async (data: WalletInput) => {
    setServerError("");
    const result = await createWalletAction(data);
    if (result?.error) {
      setServerError(result.error);
      showToast.error(result.error);
    } else {
      showToast.created("Dompet");
      reset();
      setShowForm(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus dompet ini?")) return;
    const result = await deleteWalletAction(id);
    if (result?.error) showToast.error(result.error);
    else showToast.deleted("Dompet");
  };

  const totalBalance = wallets.reduce((s, w) => s + Number(w.balance), 0);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dompet</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Total: <span className="font-semibold text-emerald-700">{formatCurrency(totalBalance)}</span>
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Tambah Dompet
        </Button>
      </div>

      {wallets.length === 0 ? (
        <EmptyState
          icon="💳"
          title="Belum ada dompet"
          description="Tambah dompet untuk mulai mencatat transaksi."
          action={<Button onClick={() => setShowForm(true)}>Tambah Dompet</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 group relative overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-5"
                style={{ background: w.color }}
              />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `${w.color}15` }}
                  >
                    {w.icon}
                  </div>
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => handleDelete(w.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{w.name}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(w.balance.toString())}</p>
                <span className="text-xs text-gray-400 mt-1 inline-block">
                  {WALLET_TYPES.find((t) => t.value === w.type)?.label ?? w.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Tambah Dompet">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{serverError}</div>
          )}
          <FormField label="Nama Dompet" error={errors.name?.message}>
            <Input type="text" placeholder="Contoh: BCA Tabungan" {...register("name")} />
          </FormField>
          <FormField label="Tipe Dompet" error={errors.type?.message}>
            <select {...register("type")} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white">
              {WALLET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Saldo Awal (Rp)" error={errors.balance?.message}>
            <Input type="number" placeholder="0" {...register("balance", { valueAsNumber: true })} />
          </FormField>

          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Ikon</p>
            <div className="flex flex-wrap gap-2">
              {WALLET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setValue("icon", icon)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${selectedIcon === icon ? "ring-2 ring-emerald-500 bg-emerald-50" : "bg-gray-50 hover:bg-gray-100"}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Warna</p>
            <div className="flex flex-wrap gap-2">
              {WALLET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue("color", color)}
                  className={`w-8 h-8 rounded-full transition-all ${selectedColor === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-105"}`}
                  style={{ background: color }}
                />
              ))}
            </div>
            <input type="hidden" {...register("color")} />
            <input type="hidden" {...register("icon")} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>Batal</Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">Simpan</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}