import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi").max(50),
  icon: z.string().min(1, "Ikon wajib dipilih"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Warna tidak valid"),
  type: z.enum(["INCOME", "EXPENSE"]),
});

export type CategoryInput = z.infer<typeof categorySchema>;