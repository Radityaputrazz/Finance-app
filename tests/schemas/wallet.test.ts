import { describe, it, expect } from "vitest";
import { walletSchema } from "@/features/wallets/schemas";

describe("walletSchema", () => {
  const validWallet = {
    name: "BCA Tabungan",
    type: "BANK" as const,
    balance: 5000000,
    currency: "IDR",
    color: "#3b82f6",
    icon: "🏦",
  };

  it("valid dengan data lengkap", () => {
    const result = walletSchema.safeParse(validWallet);
    expect(result.success).toBe(true);
  });

  describe("name", () => {
    it("invalid jika kosong", () => {
      const result = walletSchema.safeParse({ ...validWallet, name: "" });
      expect(result.success).toBe(false);
    });

    it("invalid jika lebih 50 karakter", () => {
      const result = walletSchema.safeParse({ ...validWallet, name: "a".repeat(51) });
      expect(result.success).toBe(false);
    });
  });

  describe("type", () => {
    const types = ["CASH", "BANK", "EWALLET", "CREDIT_CARD", "INVESTMENT"] as const;

    types.forEach((type) => {
      it(`valid untuk tipe ${type}`, () => {
        const result = walletSchema.safeParse({ ...validWallet, type });
        expect(result.success).toBe(true);
      });
    });

    it("invalid untuk tipe tidak dikenal", () => {
      const result = walletSchema.safeParse({ ...validWallet, type: "CRYPTO" });
      expect(result.success).toBe(false);
    });
  });

  describe("balance", () => {
    it("valid dengan saldo 0", () => {
      const result = walletSchema.safeParse({ ...validWallet, balance: 0 });
      expect(result.success).toBe(true);
    });

    it("valid dengan saldo besar", () => {
      const result = walletSchema.safeParse({ ...validWallet, balance: 999999999 });
      expect(result.success).toBe(true);
    });

    it("invalid jika bukan number", () => {
      const result = walletSchema.safeParse({ ...validWallet, balance: "bukan angka" });
      expect(result.success).toBe(false);
    });
  });

  describe("color", () => {
    it("valid hex 6 digit", () => {
      const result = walletSchema.safeParse({ ...validWallet, color: "#10b981" });
      expect(result.success).toBe(true);
    });

    it("invalid tanpa #", () => {
      const result = walletSchema.safeParse({ ...validWallet, color: "10b981" });
      expect(result.success).toBe(false);
    });
  });
});