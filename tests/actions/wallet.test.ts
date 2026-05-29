import { describe, it, expect, vi, beforeEach } from "vitest";
import { createWalletAction, deleteWalletAction } from "@/features/wallets/actions";
import { prisma } from "@/lib/db/prisma";

const mockWallet = {
  id: "wallet-1",
  name: "BCA Tabungan",
  type: "BANK" as const,
  balance: 5000000 as any,
  currency: "IDR",
  color: "#3b82f6",
  icon: "🏦",
  userId: "test-user-id",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("createWalletAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.wallet.create).mockResolvedValue(mockWallet as any);
  });

  it("berhasil membuat dompet dengan data valid", async () => {
    const result = await createWalletAction({
      name: "BCA Tabungan",
      type: "BANK",
      balance: 5000000,
      currency: "IDR",
      color: "#3b82f6",
      icon: "🏦",
    });
    expect(result.success).toBe(true);
    expect(prisma.wallet.create).toHaveBeenCalledOnce();
  });

  it("gagal jika nama kosong", async () => {
    const result = await createWalletAction({
      name: "",
      type: "BANK",
      balance: 0,
      currency: "IDR",
      color: "#3b82f6",
      icon: "🏦",
    });
    expect(result.success).toBe(false);
    expect(prisma.wallet.create).not.toHaveBeenCalled();
  });

  it("gagal jika tipe tidak valid", async () => {
    const result = await createWalletAction({
      name: "Test",
      type: "INVALID" as any,
      balance: 0,
      currency: "IDR",
      color: "#3b82f6",
      icon: "🏦",
    });
    expect(result.success).toBe(false);
    expect(prisma.wallet.create).not.toHaveBeenCalled();
  });

  it("valid dengan saldo 0", async () => {
    const result = await createWalletAction({
      name: "Dompet Kosong",
      type: "CASH",
      balance: 0,
      currency: "IDR",
      color: "#10b981",
      icon: "💵",
    });
    expect(result.success).toBe(true);
  });
});

describe("deleteWalletAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.transaction.count).mockResolvedValue(0);
    vi.mocked(prisma.wallet.deleteMany).mockResolvedValue({ count: 1 });
  });

  it("berhasil hapus dompet tanpa transaksi", async () => {
    const result = await deleteWalletAction("wallet-1");
    expect(result.success).toBe(true);
    expect(prisma.wallet.deleteMany).toHaveBeenCalledOnce();
  });

  it("gagal hapus jika dompet punya transaksi", async () => {
    vi.mocked(prisma.transaction.count).mockResolvedValue(5);
    const result = await deleteWalletAction("wallet-1");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Tidak bisa hapus dompet");
    expect(prisma.wallet.deleteMany).not.toHaveBeenCalled();
  });

  it("gagal jika Prisma throw error", async () => {
    vi.mocked(prisma.transaction.count).mockRejectedValue(new Error("DB Error"));
    const result = await deleteWalletAction("wallet-1");
    expect(result.success).toBe(false);
  });
});