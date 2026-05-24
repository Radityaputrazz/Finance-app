"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import type { Category } from "@prisma/client";
import { categorySchema, type CategoryInput } from "@/features/categories/schemas";
import { createCategoryAction, updateCategoryAction } from "@/features/categories/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { showToast } from "@/lib/utils/toast";

const ICONS = [
  "💼","💻","📈","🎁","🎀","💰","🏆","🎯",
  "🍜","🍕","☕","🛒","🚗","🚌","✈️","⛽",
  "🏠","🏥","💊","🎮","🎬","📚","👔","💄",
  "📋","💡","🔧","📦","🎵","⚽","🐾","🌱",
];

const COLORS = [
  "#10b981","#06b6d4","#3b82f6","#8b5cf6",
  "#ec4899","#f43f5e","#ef4444","#f97316",
  "#f59e0b","#84cc16","#14b8a6","#64748b",
];

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  category?: Category;
}

export function CategoryForm({ open, onClose, category }: CategoryFormProps) {
  const [serverError, setServerError] = useState("");
  const isEdit = !!category;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { type: "EXPENSE", icon: "📦", color: "#64748b" },
  });

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type as "INCOME" | "EXPENSE",
      });
    } else {
      reset({ type: "EXPENSE", icon: "📦", color: "#64748b" });
    }
  }, [category, reset]);

  const onSubmit = async (data: CategoryInput) => {
    setServerError("");
    const result = isEdit
      ? await updateCategoryAction(category!.id, data)
      : await createCategoryAction(data);

    if (result?.error) {
      setServerError(result.error);
      showToast.error(result.error);
    } else {
      showToast.success(isEdit ? "Kategori berhasil diperbarui" : "Kategori berhasil ditambahkan");
      onClose();
    }
  };

  const type = watch("type");

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Kategori" : "Tambah Kategori"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
            {serverError}
          </div>
        )}

        {/* Type */}
        <div className="flex gap-1 bg-gray-50 rounded-xl p-1">
          {(["INCOME", "EXPENSE"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setValue("type", t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                type === t
                  ? t === "INCOME"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-red-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "INCOME" ? "Pemasukan" : "Pengeluaran"}
            </button>
          ))}
        </div>

        <FormField label="Nama Kategori" error={errors.name?.message}>
          <Input type="text" placeholder="Contoh: Makan & Minum" {...register("name")} />
        </FormField>

        {/* Icon picker */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">
            Ikon <span className="text-gray-400 font-normal">— terpilih: {selectedIcon}</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setValue("icon", icon)}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                  selectedIcon === icon
                    ? "ring-2 ring-emerald-500 bg-emerald-50 scale-110"
                    : "bg-gray-50 hover:bg-gray-100 hover:scale-105"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
          <input type="hidden" {...register("icon")} />
        </div>

        {/* Color picker */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Warna</p>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue("color", color)}
                className={`w-8 h-8 rounded-full transition-all ${
                  selectedColor === color
                    ? "ring-2 ring-offset-2 ring-gray-400 scale-125"
                    : "hover:scale-110"
                }`}
                style={{ background: color }}
              />
            ))}
          </div>
          <input type="hidden" {...register("color")} />
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: `${selectedColor}20` }}
          >
            {selectedIcon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">
              {watch("name") || "Nama kategori"}
            </p>
            <p className="text-xs text-gray-400">
              {type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
            </p>
          </div>
          <div
            className="ml-auto w-3 h-3 rounded-full"
            style={{ background: selectedColor }}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={isSubmitting} className="flex-1">
            {isEdit ? "Simpan" : "Tambah"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}