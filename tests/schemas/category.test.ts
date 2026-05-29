import { describe, it, expect } from "vitest";
import { categorySchema } from "@/features/categories/schemas";

describe("categorySchema", () => {
  const validCategory = {
    name: "Makan & Minum",
    icon: "🍜",
    color: "#ef4444",
    type: "EXPENSE" as const,
  };

  it("valid dengan data lengkap", () => {
    const result = categorySchema.safeParse(validCategory);
    expect(result.success).toBe(true);
  });

  describe("name", () => {
    it("invalid jika kosong", () => {
      const result = categorySchema.safeParse({ ...validCategory, name: "" });
      expect(result.success).toBe(false);
    });

    it("invalid jika lebih dari 50 karakter", () => {
      const result = categorySchema.safeParse({
        ...validCategory,
        name: "a".repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it("valid dengan nama normal", () => {
      const result = categorySchema.safeParse({ ...validCategory, name: "Transportasi" });
      expect(result.success).toBe(true);
    });
  });

  describe("color", () => {
    it("valid hex color 6 digit", () => {
      const result = categorySchema.safeParse({ ...validCategory, color: "#10b981" });
      expect(result.success).toBe(true);
    });

    it("invalid format warna tanpa #", () => {
      const result = categorySchema.safeParse({ ...validCategory, color: "10b981" });
      expect(result.success).toBe(false);
    });

    it("invalid format warna 3 digit", () => {
      const result = categorySchema.safeParse({ ...validCategory, color: "#fff" });
      expect(result.success).toBe(false);
    });

    it("invalid format warna bukan hex", () => {
      const result = categorySchema.safeParse({ ...validCategory, color: "#zzzzzz" });
      expect(result.success).toBe(false);
    });
  });

  describe("type", () => {
    it("valid untuk INCOME", () => {
      const result = categorySchema.safeParse({ ...validCategory, type: "INCOME" });
      expect(result.success).toBe(true);
    });

    it("valid untuk EXPENSE", () => {
      const result = categorySchema.safeParse({ ...validCategory, type: "EXPENSE" });
      expect(result.success).toBe(true);
    });

    it("invalid untuk TRANSFER", () => {
      const result = categorySchema.safeParse({ ...validCategory, type: "TRANSFER" });
      expect(result.success).toBe(false);
    });
  });

  describe("icon", () => {
    it("invalid jika kosong", () => {
      const result = categorySchema.safeParse({ ...validCategory, icon: "" });
      expect(result.success).toBe(false);
    });
  });
});