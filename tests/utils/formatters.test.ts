import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  parseDecimal,
  calcPercentage,
  getBudgetDateRange,
} from "@/lib/utils";

describe("formatCurrency", () => {
  it("format angka ke Rupiah", () => {
    const result = formatCurrency(1000000);
    expect(result).toContain("1.000.000");
    expect(result).toContain("Rp");
  });

  it("format angka 0", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });

  it("format angka besar", () => {
    const result = formatCurrency(100000000);
    expect(result).toContain("100.000.000");
  });

  it("format string angka", () => {
    const result = formatCurrency("500000");
    expect(result).toContain("500.000");
  });
});

describe("formatDate", () => {
  it("format tanggal ISO ke Indonesia", () => {
    const result = formatDate("2025-05-01");
    expect(result).toContain("2025");
    expect(result).toMatch(/1\sMei\s2025|May\s2025/);
  });

  it("format Date object", () => {
    const result = formatDate(new Date("2025-12-25"));
    expect(result).toContain("2025");
  });
});

describe("parseDecimal", () => {
  it("parse number biasa", () => {
    expect(parseDecimal(1000)).toBe(1000);
  });

  it("parse string number", () => {
    expect(parseDecimal("5000")).toBe(5000);
  });

  it("parse Prisma Decimal-like object", () => {
    const decimal = { toNumber: () => 75000 };
    expect(parseDecimal(decimal)).toBe(75000);
  });

  it("return 0 untuk nilai tidak valid", () => {
    expect(parseDecimal("bukan angka")).toBe(0);
  });
});

describe("calcPercentage", () => {
  it("hitung persentase benar", () => {
    expect(calcPercentage(50, 100)).toBe(50);
    expect(calcPercentage(1, 4)).toBe(25);
    expect(calcPercentage(3, 3)).toBe(100);
  });

  it("return 0 jika total 0 (hindari division by zero)", () => {
    expect(calcPercentage(50, 0)).toBe(0);
  });

  it("return 0 jika value 0", () => {
    expect(calcPercentage(0, 100)).toBe(0);
  });
});

describe("getBudgetDateRange", () => {
  const date = new Date("2025-05-15");

  it("MONTHLY — dari awal sampai akhir bulan", () => {
    const { from, to } = getBudgetDateRange("MONTHLY", date);
    expect(from.getDate()).toBe(1);
    expect(to.getMonth()).toBe(date.getMonth());
  });

  it("WEEKLY — from sebelum to", () => {
    const { from, to } = getBudgetDateRange("WEEKLY", date);
    expect(from.getTime()).toBeLessThan(to.getTime());
  });

  it("YEARLY — dari Januari sampai Desember", () => {
    const { from, to } = getBudgetDateRange("YEARLY", date);
    expect(from.getMonth()).toBe(0); // Januari
    expect(to.getMonth()).toBe(11);  // Desember
  });
});