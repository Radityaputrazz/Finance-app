import { describe, it, expect } from "vitest";
import { transactionSchema } from "@/features/transactions/schemas";

describe("transactionSchema", () => {
  const validBase = {
    amount: 100000,
    type: "EXPENSE" as const,
    description: "Makan siang",
    date: "2025-05-01",
    categoryId: "cat-1",
    walletId: "wallet-1",
  };

  describe("amount", () => {
    it("valid jika amount positif", () => {
      const result = transactionSchema.safeParse(validBase);
      expect(result.success).toBe(true);
    });

    it("invalid jika amount 0", () => {
      const result = transactionSchema.safeParse({ ...validBase, amount: 0 });
      expect(result.success).toBe(false);
    });

    it("invalid jika amount negatif", () => {
      const result = transactionSchema.safeParse({ ...validBase, amount: -1000 });
      expect(result.success).toBe(false);
    });
  });

  describe("type", () => {
    it("valid untuk INCOME", () => {
      const result = transactionSchema.safeParse({
        ...validBase,
        type: "INCOME",
      });
      expect(result.success).toBe(true);
    });

    it("valid untuk EXPENSE", () => {
      const result = transactionSchema.safeParse(validBase);
      expect(result.success).toBe(true);
    });

    it("valid untuk TRANSFER dengan toWalletId", () => {
      const result = transactionSchema.safeParse({
        ...validBase,
        type: "TRANSFER",
        categoryId: undefined,
        toWalletId: "wallet-2",
      });
      expect(result.success).toBe(true);
    });

    it("invalid untuk TRANSFER tanpa toWalletId", () => {
      const result = transactionSchema.safeParse({
        ...validBase,
        type: "TRANSFER",
        categoryId: undefined,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain("toWalletId");
      }
    });

    it("invalid untuk type yang tidak dikenal", () => {
      const result = transactionSchema.safeParse({ ...validBase, type: "INVALID" });
      expect(result.success).toBe(false);
    });
  });

  describe("description", () => {
    it("invalid jika kosong", () => {
      const result = transactionSchema.safeParse({ ...validBase, description: "" });
      expect(result.success).toBe(false);
    });

    it("invalid jika lebih dari 200 karakter", () => {
      const result = transactionSchema.safeParse({
        ...validBase,
        description: "a".repeat(201),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("date", () => {
    it("invalid jika kosong", () => {
      const result = transactionSchema.safeParse({ ...validBase, date: "" });
      expect(result.success).toBe(false);
    });

    it("valid format ISO date", () => {
      const result = transactionSchema.safeParse({
        ...validBase,
        date: "2025-12-31",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("note", () => {
    it("opsional — valid tanpa note", () => {
      const result = transactionSchema.safeParse(validBase);
      expect(result.success).toBe(true);
    });

    it("valid dengan note", () => {
      const result = transactionSchema.safeParse({ ...validBase, note: "catatan tambahan" });
      expect(result.success).toBe(true);
    });

    it("invalid jika note lebih dari 500 karakter", () => {
      const result = transactionSchema.safeParse({
        ...validBase,
        note: "a".repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("EXPENSE/INCOME wajib categoryId", () => {
    it("invalid jika EXPENSE tanpa categoryId", () => {
      const result = transactionSchema.safeParse({
        ...validBase,
        type: "EXPENSE",
        categoryId: undefined,
      });
      expect(result.success).toBe(false);
    });

    it("invalid jika INCOME tanpa categoryId", () => {
      const result = transactionSchema.safeParse({
        ...validBase,
        type: "INCOME",
        categoryId: undefined,
      });
      expect(result.success).toBe(false);
    });
  });
});