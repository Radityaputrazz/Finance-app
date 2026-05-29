import { describe, it, expect } from "vitest";
import { budgetSchema } from "@/features/budgets/schemas";

describe("budgetSchema", () => {
  const validBudget = {
    amount: 2000000,
    period: "MONTHLY" as const,
    categoryId: "cat-makan",
    startDate: "2025-05-01",
    endDate: "2025-05-31",
  };

  it("valid dengan data lengkap", () => {
    const result = budgetSchema.safeParse(validBudget);
    expect(result.success).toBe(true);
  });

  describe("amount", () => {
    it("invalid jika 0", () => {
      const result = budgetSchema.safeParse({ ...validBudget, amount: 0 });
      expect(result.success).toBe(false);
    });

    it("invalid jika negatif", () => {
      const result = budgetSchema.safeParse({ ...validBudget, amount: -500000 });
      expect(result.success).toBe(false);
    });

    it("valid jumlah besar", () => {
      const result = budgetSchema.safeParse({ ...validBudget, amount: 50000000 });
      expect(result.success).toBe(true);
    });
  });

  describe("period", () => {
    const periods = ["WEEKLY", "MONTHLY", "YEARLY"] as const;

    periods.forEach((period) => {
      it(`valid untuk periode ${period}`, () => {
        const result = budgetSchema.safeParse({ ...validBudget, period });
        expect(result.success).toBe(true);
      });
    });

    it("invalid untuk periode tidak dikenal", () => {
      const result = budgetSchema.safeParse({ ...validBudget, period: "DAILY" });
      expect(result.success).toBe(false);
    });
  });

  describe("categoryId", () => {
    it("invalid jika kosong", () => {
      const result = budgetSchema.safeParse({ ...validBudget, categoryId: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("dates", () => {
    it("invalid jika startDate kosong", () => {
      const result = budgetSchema.safeParse({ ...validBudget, startDate: "" });
      expect(result.success).toBe(false);
    });

    it("invalid jika endDate kosong", () => {
      const result = budgetSchema.safeParse({ ...validBudget, endDate: "" });
      expect(result.success).toBe(false);
    });
  });
});