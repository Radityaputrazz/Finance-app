"use client";

import { useState } from "react";
import { Pencil, Trash2, ShieldAlert } from "lucide-react";
import type { Category } from "@prisma/client";
import type { CategoryWithCount } from "@/features/categories/types";
import { deleteCategoryAction } from "@/features/categories/actions";
import { CategoryForm } from "./CategoryForm";
import { Badge, EmptyState } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/lib/utils/toast";
import { isActionError } from "@/lib/utils/action";

interface CategoryListProps {
  categories: CategoryWithCount[];
  type: "INCOME" | "EXPENSE";
}

export function CategoryList({ categories, type }: CategoryListProps) {
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = categories.filter((c) => c.type === type);

  const handleDelete = async (cat: CategoryWithCount) => {
    if (cat._count.transactions > 0) {
      showToast.error(`Kategori "${cat.name}" dipakai di ${cat._count.transactions} transaksi`);
      return;
    }
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return;
    setDeletingId(cat.id);
    const result = await deleteCategoryAction(cat.id);
    if (result?.error) showToast.error(result.error);
    else showToast.deleted("Kategori");
    setDeletingId(null);
  };

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={type === "INCOME" ? "💰" : "🛒"}
        title={`Belum ada kategori ${type === "INCOME" ? "pemasukan" : "pengeluaran"}`}
        description="Tambah kategori baru untuk mengorganisasi transaksi Anda."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((cat) => (
          <div
            key={cat.id}
            className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 group flex items-center gap-3 transition-opacity ${
              deletingId === cat.id ? "opacity-40" : ""
            }`}
          >
            {/* Icon */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: `${cat.color}18` }}
            >
              {cat.icon}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{cat.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                <span className="text-xs text-gray-400">
                  {cat._count.transactions} transaksi
                </span>
                {cat.isDefault && (
                  <Badge variant="neutral" className="text-[10px] px-1.5 py-0">
                    default
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEditCat(cat)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <button
                onClick={() => handleDelete(cat)}
                className={`p-1.5 rounded-lg transition-colors ${
                  cat._count.transactions > 0
                    ? "hover:bg-amber-50"
                    : "hover:bg-red-50"
                }`}
                title={cat._count.transactions > 0 ? "Ada transaksi terkait" : "Hapus"}
              >
                {cat._count.transactions > 0 ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editCat && (
        <CategoryForm
          open={!!editCat}
          onClose={() => setEditCat(null)}
          category={editCat}
        />
      )}
    </>
  );
}