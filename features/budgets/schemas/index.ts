import { z } from "zod";

export const budgetSchema = z.object({
  amount: z.number().positive("Jumlah anggaran harus lebih dari 0"),
  period: z.enum(["WEEKLY", "MONTHLY", "YEARLY"]),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
});

export type BudgetInput = z.infer<typeof budgetSchema>;