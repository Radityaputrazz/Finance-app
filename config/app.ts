export const APP_NAME = "FinanceKu";
export const APP_DESCRIPTION = "Manajemen Keuangan Pribadi";

export const CURRENCY = {
  code: "IDR",
  locale: "id-ID",
  symbol: "Rp",
} as const;

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
} as const;

export const TRANSACTION_TYPES = [
  { value: "INCOME", label: "Pemasukan", color: "#10b981" },
  { value: "EXPENSE", label: "Pengeluaran", color: "#ef4444" },
  { value: "TRANSFER", label: "Transfer", color: "#3b82f6" },
] as const;

export const WALLET_TYPES = [
  { value: "CASH", label: "Tunai", icon: "💵" },
  { value: "BANK", label: "Rekening Bank", icon: "🏦" },
  { value: "EWALLET", label: "Dompet Digital", icon: "📱" },
  { value: "CREDIT_CARD", label: "Kartu Kredit", icon: "💳" },
  { value: "INVESTMENT", label: "Investasi", icon: "📈" },
] as const;

export const BUDGET_PERIODS = [
  { value: "WEEKLY", label: "Mingguan" },
  { value: "MONTHLY", label: "Bulanan" },
  { value: "YEARLY", label: "Tahunan" },
] as const;

export const DEFAULT_CATEGORIES = [
  // INCOME
  { name: "Gaji", icon: "💼", color: "#10b981", type: "INCOME" as const },
  { name: "Freelance", icon: "💻", color: "#06b6d4", type: "INCOME" as const },
  { name: "Investasi", icon: "📈", color: "#8b5cf6", type: "INCOME" as const },
  { name: "Bonus", icon: "🎁", color: "#f59e0b", type: "INCOME" as const },
  { name: "Hadiah", icon: "🎀", color: "#ec4899", type: "INCOME" as const },
  // EXPENSE
  { name: "Makan & Minum", icon: "🍜", color: "#ef4444", type: "EXPENSE" as const },
  { name: "Transportasi", icon: "🚗", color: "#f97316", type: "EXPENSE" as const },
  { name: "Belanja", icon: "🛒", color: "#ec4899", type: "EXPENSE" as const },
  { name: "Tagihan & Utilitas", icon: "📋", color: "#6366f1", type: "EXPENSE" as const },
  { name: "Kesehatan", icon: "🏥", color: "#14b8a6", type: "EXPENSE" as const },
  { name: "Hiburan", icon: "🎮", color: "#a855f7", type: "EXPENSE" as const },
  { name: "Pendidikan", icon: "📚", color: "#3b82f6", type: "EXPENSE" as const },
  { name: "Rumah & Properti", icon: "🏠", color: "#84cc16", type: "EXPENSE" as const },
  { name: "Pakaian", icon: "👔", color: "#f43f5e", type: "EXPENSE" as const },
  { name: "Lainnya", icon: "📦", color: "#64748b", type: "EXPENSE" as const },
] as const;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/transactions", label: "Transaksi", icon: "ArrowLeftRight" },
  { href: "/wallets", label: "Dompet", icon: "Wallet" },
  { href: "/budgets", label: "Anggaran", icon: "PiggyBank" },
  { href: "/categories", label: "Kategori", icon: "Tag" },
  { href: "/reports", label: "Laporan", icon: "BarChart2" },
] as const;