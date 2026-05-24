"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { CategoryWithCount } from "@/features/categories/types";
import { CategoryList } from "@/features/categories/components/CategoryList";
import { CategoryForm } from "@/features/categories/components/CategoryForm";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface CategoriesClientProps {
  categories: CategoryWithCount[];
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  const incomeCount = categories.filter((c) => c.type === "INCOME").length;
  const expenseCount = categories.filter((c) => c.type === "EXPENSE").length;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategori</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {incomeCount} pemasukan · {expenseCount} pengeluaran
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Tambah Kategori
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {(["EXPENSE", "INCOME"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab === "EXPENSE" ? "🛒 Pengeluaran" : "💰 Pemasukan"}
            <span
              className={cn(
                "ml-2 text-xs px-1.5 py-0.5 rounded-full",
                activeTab === tab
                  ? "bg-gray-100 text-gray-600"
                  : "bg-gray-200 text-gray-500"
              )}
            >
              {tab === "EXPENSE" ? expenseCount : incomeCount}
            </span>
          </button>
        ))}
      </div>

      <CategoryList categories={categories} type={activeTab} />

      <CategoryForm
        open={showForm}
        onClose={() => setShowForm(false)}
      />
    </>
  );
}