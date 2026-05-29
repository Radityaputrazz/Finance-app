import { describe, it, expect, vi, beforeEach } from "vitest";
import { createBudgetAction, deleteBudgetAction } from "@/features/budgets/actions";
import { prisma } from "@/lib/db/prisma";

const mockCategory = {
  id: "cat-makan",
  name: "Makan",
  icon: "🍜",
  color: "#ef4444",
  type: "EXPENSE" as const,
  isDefault: false,
  userId: "test-user-id",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockBudget = {
  id: "budget-1",
  amount: 2000000 as any,
  period: "MONTHLY" as const,
  categoryId: "cat-makan",
  startDate: new Date("2025-05-01"),
  endDate: new Date("2025-05-31"),
  userId: "test-user-id",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("createBudgetAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.budget.create).mockResolvedValue({
      ...mockBudget,
      category: mockCategory,
    } as any);
  });

  it("berhasil membuat anggaran dengan data valid", async () => {
    const result = await createBudgetAction({
      amount: 2000000,
      period: "MONTHLY",
      categoryId: "cat-makan",
      startDate: "2025-05-01",
      endDate: "2025-05-31",
    });
    expect(result.success).toBe(true);
    expect(prisma.budget.create).toHaveBeenCalledOnce();
  });

  it("gagal jika amount 0", async () => {
    const result = await createBudgetAction({
      amount: 0,
      period: "MONTHLY",
      categoryId: "cat-makan",
      startDate: "2025-05-01",
      endDate: "2025-05-31",
    });
    expect(result.success).toBe(false);
    expect(prisma.budget.create).not.toHaveBeenCalled();
  });

  it("gagal jika categoryId kosong", async () => {
    const result = await createBudgetAction({
      amount: 1000000,
      period: "MONTHLY",
      categoryId: "",
      startDate: "2025-05-01",
      endDate: "2025-05-31",
    });
    expect(result.success).toBe(false);
    expect(prisma.budget.create).not.toHaveBeenCalled();
  });

  it("return error jika Prisma throw", async () => {
    vi.mocked(prisma.budget.create).mockRejectedValue(new Error("DB Error"));
    const result = await createBudgetAction({
      amount: 1000000,
      period: "MONTHLY",
      categoryId: "cat-makan",
      startDate: "2025-05-01",
      endDate: "2025-05-31",
    });
    expect(result.success).toBe(false);
  });
});

describe("deleteBudgetAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.budget.deleteMany).mockResolvedValue({ count: 1 });
  });

  it("berhasil hapus anggaran", async () => {
    const result = await deleteBudgetAction("budget-1");
    expect(result.success).toBe(true);
    expect(prisma.budget.deleteMany).toHaveBeenCalledOnce();
  });

  it("return error jika Prisma throw", async () => {
    vi.mocked(prisma.budget.deleteMany).mockRejectedValue(new Error("DB Error"));
    const result = await deleteBudgetAction("budget-tidak-ada");
    expect(result.success).toBe(false);
  });
});