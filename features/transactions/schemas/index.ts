import { z } from "zod";

export const transactionSchema = z.object({
  amount: z.number().positive("Jumlah harus lebih dari 0"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  description: z.string().min(1, "Deskripsi wajib diisi").max(200),
  note: z.string().max(500).optional(),
  date: z.string().min(1, "Tanggal wajib diisi"),
  categoryId: z.string().optional(),
  walletId: z.string().min(1, "Dompet wajib dipilih"),
  toWalletId: z.string().optional(),
}).refine(
  (data) => data.type !== "TRANSFER" || !!data.toWalletId,
  { message: "Dompet tujuan wajib dipilih untuk transfer", path: ["toWalletId"] }
).refine(
  (data) => data.type === "TRANSFER" || !!data.categoryId,
  { message: "Kategori wajib dipilih", path: ["categoryId"] }
);

export const transactionFilterSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "ALL"]).optional(),
  categoryId: z.string().optional(),
  walletId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

// Explicit type to avoid Zod v4 + hookform/resolvers v5 inference conflict
export type TransactionInput = {
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  description: string;
  note?: string;
  date: string;
  categoryId?: string;
  walletId: string;
  toWalletId?: string;
};

export type TransactionFilter = z.infer<typeof transactionFilterSchema>;