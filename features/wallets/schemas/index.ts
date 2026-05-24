import { z } from "zod";

export const walletSchema = z.object({
  name: z.string().min(1, "Nama dompet wajib diisi").max(50),
  type: z.enum(["CASH", "BANK", "EWALLET", "CREDIT_CARD", "INVESTMENT"]),
  balance: z.number(),
  currency: z.string().min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  icon: z.string().min(1, "Ikon wajib dipilih"),
});

export type WalletInput = z.infer<typeof walletSchema>;