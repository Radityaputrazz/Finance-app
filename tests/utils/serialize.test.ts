import { describe, it, expect } from "vitest";
import { serializeDecimal, serializeArray } from "@/lib/utils/serialize";

describe("serializeDecimal", () => {
  it("convert Prisma Decimal-like object ke number", () => {
    const input = { balance: { toNumber: () => 5000000 } };
    const result = serializeDecimal(input);
    expect(result.balance).toBe(5000000);
  });

  it("tidak mengubah number biasa", () => {
    const input = { amount: 100000 };
    const result = serializeDecimal(input);
    expect(result.amount).toBe(100000);
  });

  it("tidak mengubah string", () => {
    const input = { name: "test" };
    const result = serializeDecimal(input);
    expect(result.name).toBe("test");
  });

  it("handle nested object", () => {
    const input = {
      wallet: { balance: { toNumber: () => 1000 } },
      name: "BCA",
    };
    const result = serializeDecimal(input);
    expect(result.wallet.balance).toBe(1000);
    expect(result.name).toBe("BCA");
  });

  it("handle null/undefined", () => {
    expect(serializeDecimal(null)).toBeNull();
    expect(serializeDecimal(undefined)).toBeUndefined();
  });

  it("handle Date object — tidak diubah", () => {
    const date = new Date("2025-05-01");
    const input = { createdAt: date };
    const result = serializeDecimal(input);
    expect(result.createdAt).toEqual(date);
  });
});

describe("serializeArray", () => {
  it("serialize semua item dalam array", () => {
    const items = [
      { balance: { toNumber: () => 1000 }, name: "Wallet A" },
      { balance: { toNumber: () => 2000 }, name: "Wallet B" },
    ];
    const result = serializeArray(items);
    expect(result[0].balance).toBe(1000);
    expect(result[1].balance).toBe(2000);
  });

  it("return array kosong jika input kosong", () => {
    expect(serializeArray([])).toEqual([]);
  });
});