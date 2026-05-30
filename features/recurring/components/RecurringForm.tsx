"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import type { Category, Wallet } from "@prisma/client";
import { recurringSchema, type RecurringInput } from "@/features/recurring/schemas";
import { createRecurringAction } from "@/features/recurring/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { showToast } from "@/lib/utils/toast";
import { toISODate } from "@/lib/utils";

const FREQUENCIES = [
  { value: "DAILY",   label: "Setiap Hari" },
  { value: "WEEKLY",  label: "Setiap Minggu" },
  { value: "MONTHLY", label: "Setiap Bulan" },
  { value: "YEARLY",  label: "Setiap Tahun" },
];

interface RecurringFormProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  wallets: Wallet[];
}

export function RecurringForm({ open, onClose, categories, wallets }: RecurringFormProps) {
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<RecurringInput>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      type: "EXPENSE",
      frequency: "MONTHLY",
      startDate: toISODate(new Date()),
      amount: 0,
    },
  });

  const type = watch("type");
  const filteredCats = categories.filter((c) => c.type === type);

  const onSubmit = async (data: RecurringInput) => {
    setServerError("");
    const result = await createRecurringAction(data);
    if (result.success) {
      showToast.created("Transaksi berulang");
      reset();
      onClose();
    } else {
      setServerError(result.error ?? "Terjadi kesalahan");
      showToast.error(result.error ?? "Terjadi kesalahan");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Tambah Transaksi Berulang">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
            {serverError}
          </div>
        )}

        {/* Type */}
        <div className="flex gap-1 bg-gray-50 dark:bg-slate-700 rounded-xl p-1">
          {(["INCOME", "EXPENSE"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => reset({ ...watch(), type: t })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                type === t
                  ? t === "INCOME" ? "bg-emerald-500 text-white shadow-sm" : "bg-red-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:text-slate-400"
              }`}
            >
              {t === "INCOME" ? "Pemasukan" : "Pengeluaran"}
            </button>
          ))}
        </div>

        <FormField label="Jumlah (Rp)" error={errors.amount?.message}>
          <Input type="number" placeholder="0" {...register("amount", { valueAsNumber: true })} />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Kategori" error={errors.categoryId?.message}>
            <select {...register("categoryId")} className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white dark:bg-slate-800">
              {filteredCats.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Dompet" error={errors.walletId?.message}>
            <select {...register("walletId")} className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white dark:bg-slate-800">
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Deskripsi" error={errors.description?.message}>
          <Input type="text" placeholder="Contoh: Gaji bulanan" {...register("description")} />
        </FormField>

        <FormField label="Frekuensi" error={errors.frequency?.message}>
          <select {...register("frequency")} className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white dark:bg-slate-800">
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Mulai" error={errors.startDate?.message}>
            <Input type="date" {...register("startDate")} />
          </FormField>
          <FormField label="Selesai (opsional)" error={errors.endDate?.message}>
            <Input type="date" {...register("endDate")} />
          </FormField>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={isSubmitting} className="flex-1">Simpan</Button>
        </div>
      </form>
    </Modal>
  );
}