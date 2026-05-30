import { z } from "zod";

export const recurringSchema = z.object({
  amount: z.number().positive("Jumlah harus lebih dari 0"),
  type: z.enum(["INCOME", "EXPENSE"]),
  description: z.string().min(1, "Deskripsi wajib diisi").max(200),
  note: z.string().max(500).optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().optional(),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  walletId: z.string().min(1, "Dompet wajib dipilih"),
});

export type RecurringInput = {
  amount: number;
  type: "INCOME" | "EXPENSE";
  description: string;
  note?: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  startDate: string;
  endDate?: string;
  categoryId: string;
  walletId: string;
};