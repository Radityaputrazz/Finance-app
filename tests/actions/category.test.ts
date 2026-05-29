import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCategoryAction, deleteCategoryAction } from "@/features/categories/actions";
import { prisma } from "@/lib/db/prisma";

const mockCategory = {
  id: "cat-1",
  name: "Makan",
  icon: "🍜",
  color: "#ef4444",
  type: "EXPENSE" as const,
  isDefault: false,
  userId: "test-user-id",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("createCategoryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.category.create).mockResolvedValue(mockCategory);
  });

  it("berhasil membuat kategori dengan data valid", async () => {
    const result = await createCategoryAction({
      name: "Makan",
      icon: "🍜",
      color: "#ef4444",
      type: "EXPENSE",
    });
    expect(result.success).toBe(true);
    expect(prisma.category.create).toHaveBeenCalledOnce();
  });

  it("gagal jika nama kosong", async () => {
    const result = await createCategoryAction({
      name: "",
      icon: "🍜",
      color: "#ef4444",
      type: "EXPENSE",
    });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(prisma.category.create).not.toHaveBeenCalled();
  });

  it("gagal jika warna format salah", async () => {
    const result = await createCategoryAction({
      name: "Test",
      icon: "📦",
      color: "invalid-color",
      type: "EXPENSE",
    });
    expect(result.success).toBe(false);
    expect(prisma.category.create).not.toHaveBeenCalled();
  });

  it("return error jika Prisma throw", async () => {
    vi.mocked(prisma.category.create).mockRejectedValue(new Error("DB Error"));
    const result = await createCategoryAction({
      name: "Test",
      icon: "📦",
      color: "#10b981",
      type: "EXPENSE",
    });
    expect(result.success).toBe(false);
  });
});

describe("deleteCategoryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.category.findFirst).mockResolvedValue(mockCategory);
    vi.mocked(prisma.transaction.count).mockResolvedValue(0);
    vi.mocked(prisma.category.deleteMany).mockResolvedValue({ count: 1 });
  });

  it("berhasil hapus kategori yang tidak dipakai", async () => {
    const result = await deleteCategoryAction("cat-1");
    expect(result.success).toBe(true);
    expect(prisma.category.deleteMany).toHaveBeenCalledOnce();
  });

  it("gagal hapus jika kategori dipakai di transaksi", async () => {
    vi.mocked(prisma.transaction.count).mockResolvedValue(3);
    const result = await deleteCategoryAction("cat-1");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Tidak bisa hapus kategori");
    expect(prisma.category.deleteMany).not.toHaveBeenCalled();
  });
});