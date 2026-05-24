export type { User, Account, Session } from "@prisma/client";

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";
export type WalletType = "CASH" | "BANK" | "EWALLET" | "CREDIT_CARD" | "INVESTMENT";
export type BudgetPeriod = "WEEKLY" | "MONTHLY" | "YEARLY";

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface SelectOption {
  value: string;
  label: string;
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// Make specific keys required
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

// Make specific keys optional
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ID-only type
export type WithId = { id: string };