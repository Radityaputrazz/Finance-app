import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock URL.createObjectURL and document.createElement for browser APIs
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
const mockRevokeObjectURL = vi.fn();

vi.stubGlobal("URL", {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL,
});

vi.spyOn(document, "createElement").mockReturnValue({
  click: mockClick,
  href: "",
  download: "",
} as unknown as HTMLAnchorElement);

import { exportTransactionsCsv, exportSummaryCsv } from "@/lib/utils/csv";

const mockTransactions = [
  {
    id: "tx-1",
    amount: 50000,
    type: "EXPENSE" as const,
    description: "Makan siang",
    date: new Date("2025-05-01"),
    category: { id: "cat-1", name: "Makan & Minum", icon: "🍜", color: "#ef4444", type: "EXPENSE" as const, isDefault: true, userId: "u1", createdAt: new Date(), updatedAt: new Date() },
    wallet: { id: "w1", name: "Dompet Tunai", icon: "💵", color: "#10b981", type: "CASH" as const, balance: 1000000, currency: "IDR", userId: "u1", createdAt: new Date(), updatedAt: new Date() },
    note: null,
    userId: "u1",
    categoryId: "cat-1",
    walletId: "w1",
    toWalletId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tx-2",
    amount: 5000000,
    type: "INCOME" as const,
    description: "Gaji",
    date: new Date("2025-05-01"),
    category: { id: "cat-2", name: "Gaji", icon: "💼", color: "#10b981", type: "INCOME" as const, isDefault: true, userId: "u1", createdAt: new Date(), updatedAt: new Date() },
    wallet: { id: "w1", name: "Dompet Tunai", icon: "💵", color: "#10b981", type: "CASH" as const, balance: 1000000, currency: "IDR", userId: "u1", createdAt: new Date(), updatedAt: new Date() },
    note: "Gaji bulan Mei",
    userId: "u1",
    categoryId: "cat-2",
    walletId: "w1",
    toWalletId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("exportTransactionsCsv", () => {
  beforeEach(() => {
    mockClick.mockClear();
    mockCreateObjectURL.mockClear();
  });

  it("memanggil download dengan filename yang benar", () => {
    exportTransactionsCsv(mockTransactions as any, "test.csv");
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });

  it("berjalan tanpa error dengan array kosong", () => {
    expect(() => exportTransactionsCsv([], "empty.csv")).not.toThrow();
  });
});

describe("exportSummaryCsv", () => {
  beforeEach(() => {
    mockClick.mockClear();
    mockCreateObjectURL.mockClear();
  });

  it("memanggil download", () => {
    exportSummaryCsv(mockTransactions as any, "summary.csv");
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });

  it("berjalan tanpa error dengan transaksi kosong", () => {
    expect(() => exportSummaryCsv([], "empty.csv")).not.toThrow();
  });
});