"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, ChevronRight, Wallet, Tag, Target } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { createWalletAction } from "@/features/wallets/actions";
import { markOnboardedAction } from "@/features/auth/actions/onboarding";
import { cn } from "@/lib/utils";
import { showToast } from "@/lib/utils/toast";

const STEPS = [
  { id: 1, title: "Selamat datang!", icon: "🎉" },
  { id: 2, title: "Tambah Dompet Pertama", icon: "💳" },
  { id: 3, title: "Siap digunakan!", icon: "✅" },
];

const WALLET_PRESETS = [
  { name: "Dompet Tunai", type: "CASH" as const, icon: "💵", color: "#10b981" },
  { name: "Bank BCA", type: "BANK" as const, icon: "🏦", color: "#3b82f6" },
  { name: "GoPay", type: "EWALLET" as const, icon: "📱", color: "#8b5cf6" },
  { name: "OVO", type: "EWALLET" as const, icon: "💜", color: "#a855f7" },
];

interface OnboardingWizardProps {
  userName: string;
}

export function OnboardingWizard({ userName }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [walletName, setWalletName] = useState("Dompet Tunai");
  const [walletType, setWalletType] = useState<"CASH" | "BANK" | "EWALLET">("CASH");
  const [walletIcon, setWalletIcon] = useState("💵");
  const [walletColor, setWalletColor] = useState("#10b981");
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePreset = (preset: typeof WALLET_PRESETS[0]) => {
    setWalletName(preset.name);
    setWalletType(preset.type);
    setWalletIcon(preset.icon);
    setWalletColor(preset.color);
  };

  const handleCreateWallet = async () => {
    setLoading(true);
    const result = await createWalletAction({
      name: walletName,
      type: walletType,
      balance: parseFloat(balance) || 0,
      currency: "IDR",
      color: walletColor,
      icon: walletIcon,
    });

    if (!result.success) {
      showToast.error(result.error ?? "Gagal membuat dompet");
      setLoading(false);
      return;
    }

    setStep(3);
    setLoading(false);
  };

  const handleFinish = async () => {
    await markOnboardedAction();
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                step > s.id
                  ? "bg-emerald-500 text-white"
                  : step === s.id
                  ? "bg-emerald-500 text-white ring-4 ring-emerald-100"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-400"
              )}>
                {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "w-12 h-0.5 transition-all",
                  step > s.id ? "bg-emerald-500" : "bg-gray-200 dark:bg-slate-600"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 — Welcome */}
        {step === 1 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
              Halo, {userName}!
            </h1>
            <p className="text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
              Selamat datang di <span className="font-semibold text-emerald-600">FinanceKu</span>.
              Mari setup akun Anda dalam 2 langkah mudah.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: <Wallet className="w-5 h-5" />, label: "Dompet" },
                { icon: <Tag className="w-5 h-5" />, label: "Kategori" },
                { icon: <Target className="w-5 h-5" />, label: "Anggaran" },
              ].map((item) => (
                <div key={item.label} className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-3 flex flex-col items-center gap-1.5">
                  <div className="text-emerald-600">{item.icon}</div>
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{item.label}</span>
                </div>
              ))}
            </div>

            <Button className="w-full" onClick={() => setStep(2)}>
              Mulai Setup
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Step 2 — Wallet */}
        {step === 2 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl">
            <div className="text-4xl mb-3 text-center">💳</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-1 text-center">
              Tambah Dompet Pertama
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 text-center mb-6">
              Pilih preset atau isi manual
            </p>

            {/* Presets */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {WALLET_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePreset(preset)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left",
                    walletName === preset.name
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700"
                      : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                  )}
                >
                  <span className="text-lg">{preset.icon}</span>
                  {preset.name}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <FormField label="Nama Dompet">
                <Input
                  type="text"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder="Nama dompet"
                />
              </FormField>

              <FormField label="Saldo Awal (Rp)">
                <Input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0"
                  inputMode="numeric"
                />
              </FormField>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                Kembali
              </Button>
              <Button
                onClick={handleCreateWallet}
                loading={loading}
                className="flex-1"
                disabled={!walletName}
              >
                Buat Dompet
              </Button>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
            >
              Lewati langkah ini
            </button>
          </div>
        )}

        {/* Step 3 — Done */}
        {step === 3 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl text-center">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
              Semuanya siap! 🚀
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mb-2">
              Kategori default sudah dibuat otomatis.
            </p>
            <p className="text-gray-500 dark:text-slate-400 mb-8 text-sm">
              Mulai catat transaksi pertama Anda sekarang.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6 text-left">
              {[
                { icon: "✅", text: "15 kategori default" },
                { icon: "✅", text: "Dompet pertama" },
                { icon: "✅", text: "Dashboard siap" },
                { icon: "✅", text: "Laporan real-time" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                  <span>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>

            <Button className="w-full" onClick={handleFinish}>
              Mulai Gunakan FinanceKu
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}