"use client";

import { useState } from "react";
import { Menu, LogOut, ChevronDown } from "lucide-react";
import Image from "next/image";
import { Sidebar } from "./Sidebar";
import { logoutAction } from "@/features/auth/actions";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface HeaderProps {
  title: string;
  action?: React.ReactNode;
  user?: { name?: string | null; email?: string | null; image?: string | null };
}

export function Header({ title, action, user }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 h-16 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {action}
          <ThemeToggle />
          {user && (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 hover:bg-gray-50 rounded-xl transition-colors"
              >
                {user.image ? (
                  <Image src={user.image} alt={user.name || ""} width={32} height={32} className="rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-700 text-sm font-semibold">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-30 truncate">
                  {user.name || user.email}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => logoutAction()}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 shadow-2xl">
            <Sidebar onClose={() => setMobileOpen(false)} mobile />
          </div>
        </div>
      )}
    </>
  );
}