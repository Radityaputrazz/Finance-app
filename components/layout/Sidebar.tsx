"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ArrowLeftRight, Wallet, PiggyBank, Tag, BarChart2, X, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/config/app";

const ICONS = {
  LayoutDashboard, ArrowLeftRight, Wallet, PiggyBank, Tag, BarChart2, RefreshCw,
} as const;

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/transactions", label: "Transaksi", icon: "ArrowLeftRight" },
  { href: "/wallets", label: "Dompet", icon: "Wallet" },
  { href: "/budgets", label: "Anggaran", icon: "PiggyBank" },
  { href: "/recurring", label: "Berulang", icon: "RefreshCw" },
  { href: "/categories", label: "Kategori", icon: "Tag" },
  { href: "/reports", label: "Laporan", icon: "BarChart2" },
] as const;

interface SidebarProps {
  onClose?: () => void;
  mobile?: boolean;
}

export function Sidebar({ onClose, mobile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn("flex flex-col h-full bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700", mobile ? "w-full" : "w-64")}>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm shadow-emerald-500/30">
            <span className="text-base">💰</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-slate-100 text-lg tracking-tight">{APP_NAME}</span>
        </div>
        {mobile && (
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon }) => {
          const Icon = ICONS[icon as keyof typeof ICONS];
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100 dark:text-slate-100"
              )}
            >
              <Icon className={cn("w-4.5 h-4.5 shrink-0", active ? "text-emerald-600" : "text-gray-400")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">© 2025 {APP_NAME}</p>
      </div>
    </aside>
  );
}