import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Next.js modules
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/dashboard",
  redirect: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Auth
vi.mock("@/lib/auth/session", () => ({
  requireAuth: vi.fn().mockResolvedValue({
    id: "test-user-id",
    email: "test@test.com",
    name: "Test User",
  }),
  getCurrentUser: vi.fn().mockResolvedValue({
    id: "test-user-id",
    email: "test@test.com",
    name: "Test User",
  }),
}));

// Mock Prisma
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    transaction: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    category: {
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    wallet: {
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    budget: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    user: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((fn) => fn({
      transaction: {
        create: vi.fn().mockResolvedValue({ id: "tx-1" }),
        update: vi.fn().mockResolvedValue({ id: "tx-1" }),
        delete: vi.fn().mockResolvedValue({ id: "tx-1" }),
      },
      wallet: {
        update: vi.fn().mockResolvedValue({ id: "wallet-1" }),
      },
    })),
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    promise: vi.fn(),
    warning: vi.fn(),
  },
  Toaster: () => null,
}));