"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { format } from "date-fns";
import type { Category } from "@prisma/client";
import { budgetSchema, type BudgetInput } from "@/features/budgets/schemas";
import { createBudgetAction } from "@/features/budgets/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { BUDGET_PERIODS } from "@/config/app";
import { showToast } from "@/lib/utils/toast";

interface BudgetFormProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
}

export function BudgetForm({ open, onClose, categories }: BudgetFormProps) {
  const [serverError, setServerError] = useState("");

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  const today = format(new Date(), "yyyy-MM-dd");
  const endOfMonth = format(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    "yyyy-MM-dd"
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      amount: 0,
      period: "MONTHLY",
      startDate: today,
      endDate: endOfMonth,
      categoryId: expenseCategories[0]?.id ?? "",
    },
  });

  const onSubmit = async (data: BudgetInput) => {
    setServerError("");
    const result = await createBudgetAction(data);
    if (result?.error) {
      setServerError(result.error);
      showToast.error(result.error);
    } else {
      showToast.created("Anggaran");
      reset();
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Tambah Anggaran">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
            {serverError}
          </div>
        )}

        <FormField label="Kategori Pengeluaran" error={errors.categoryId?.message}>
          <select
            {...register("categoryId")}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white"
          >
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Batas Anggaran (Rp)" error={errors.amount?.message}>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="0"
            {...register("amount", { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Periode" error={errors.period?.message}>
          <select
            {...register("period")}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white"
          >
            {BUDGET_PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Mulai" error={errors.startDate?.message}>
            <Input type="date" {...register("startDate")} />
          </FormField>
          <FormField label="Selesai" error={errors.endDate?.message}>
            <Input type="date" {...register("endDate")} />
          </FormField>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={isSubmitting} className="flex-1">
            Simpan Anggaran
          </Button>
        </div>
      </form>
    </Modal>
  );
}