"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";
import { loginAction, loginWithGoogleAction } from "@/features/auth/actions";
import { getActionError } from "@/lib/utils/action";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError("");
    const result = await loginAction(data);
    const err = getActionError(result); if (err) setServerError(err);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
          <span className="text-2xl">💰</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Selamat datang kembali</h1>
        <p className="text-gray-500 text-sm mt-1">Masuk ke akun FinanceKu Anda</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
            {serverError}
          </div>
        )}

        <FormField label="Email" error={errors.email?.message}>
          <Input
            type="email"
            placeholder="nama@email.com"
            autoComplete="email"
            {...register("email")}
          />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              autoComplete="current-password"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </FormField>

        <Button type="submit" loading={isSubmitting} className="w-full">
          <LogIn className="w-4 h-4" />
          Masuk
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">atau</div>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => loginWithGoogleAction()}
        >
          <span>🌐</span>
          Masuk dengan Google
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Belum punya akun?{" "}
        <Link href="/register" className="text-emerald-600 font-medium hover:underline">
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}