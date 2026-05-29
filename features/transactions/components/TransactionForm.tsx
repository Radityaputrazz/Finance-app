"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import type { Category, Wallet } from "@prisma/client";
import { transactionSchema, type TransactionInput } from "@/features/transactions/schemas";
import { createTransactionAction, updateTransactionAction } from "@/features/transactions/actions";
import type { TransactionWithRelations } from "@/features/transactions/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { TRANSACTION_TYPES } from "@/config/app";
import { toISODate } from "@/lib/utils";
import { showToast } from "@/lib/utils/toast";
import { cn } from "@/lib/utils";

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  wallets: Wallet[];
  transaction?: TransactionWithRelations;
}

export function TransactionForm({ open, onClose, categories, wallets, transaction }: TransactionFormProps) {
  const [serverError, setServerError] = useState("");
  const isEdit = !!transaction;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      date: toISODate(new Date()),
      amount: 0,
    },
  });

  const type = watch("type");
  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (transaction) {
      reset({
        amount: Number(transaction.amount),
        type: transaction.type,
        description: transaction.description,
        note: transaction.note ?? "",
        date: toISODate(new Date(transaction.date)),
        categoryId: transaction.categoryId ?? undefined,
        walletId: transaction.walletId,
        toWalletId: transaction.toWalletId ?? undefined,
      });
    } else {
      reset({ type: "EXPENSE", date: toISODate(new Date()), amount: 0 });
    }
  }, [transaction, reset]);

  // Auto-reset categoryId when type changes
  useEffect(() => {
    const first = filteredCategories[0];
    if (first && !isEdit) setValue("categoryId", first.id);
  }, [type]);

  const onSubmit = async (data: TransactionInput) => {
    setServerError("");
    const result = isEdit
      ? await updateTransactionAction(transaction!.id, data)
      : await createTransactionAction(data);

    if (result.success) {
      showToast.success(isEdit ? "Transaksi berhasil diperbarui" : "Transaksi berhasil ditambahkan");
      onClose();
    } else {
      setServerError(result.error ?? "Terjadi kesalahan");
      showToast.error(result.error ?? "Terjadi kesalahan");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Transaksi" : "Tambah Transaksi"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
            {serverError}
          </div>
        )}

        {/* Type selector */}
        <div className="flex gap-1 bg-gray-50 rounded-xl p-1">
          {TRANSACTION_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setValue("type", t.value as TransactionInput["type"])}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                type === t.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <FormField label="Jumlah (Rp)" error={errors.amount?.message}>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="0"
            {...register("amount", { valueAsNumber: true })}
          />
        </FormField>

        <div className={type === "TRANSFER" ? "" : "grid grid-cols-2 gap-3"}>
          {type !== "TRANSFER" && (
            <FormField label="Kategori" error={errors.categoryId?.message}>
              <select
                {...register("categoryId")}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </FormField>
          )}

          <FormField label="Dompet" error={errors.walletId?.message}>
            <select
              {...register("walletId")}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.icon} {w.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {type === "TRANSFER" && (
          <FormField label="Dompet Tujuan" error={errors.toWalletId?.message}>
            <select
              {...register("toWalletId")}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white"
            >
              <option value="">Pilih dompet tujuan</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.icon} {w.name}
                </option>
              ))}
            </select>
          </FormField>
        )}

        <FormField label="Deskripsi" error={errors.description?.message}>
          <Input type="text" placeholder="Contoh: Makan siang" {...register("description")} />
        </FormField>

        <FormField label="Tanggal" error={errors.date?.message}>
          <Input type="date" {...register("date")} />
        </FormField>

        <FormField label="Catatan (opsional)" error={errors.note?.message}>
          <textarea
            {...register("note")}
            rows={2}
            placeholder="Tambah catatan tambahan..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
          />
        </FormField>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={isSubmitting} className="flex-1">
            {isEdit ? "Simpan Perubahan" : "Tambah Transaksi"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}