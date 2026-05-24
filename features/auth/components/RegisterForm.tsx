"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas";
import { registerAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";

export function RegisterForm() {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError("");
    const result = await registerAction(data);
    if (result?.error) setServerError(result.error);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
          <span className="text-2xl">💰</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Buat akun baru</h1>
        <p className="text-gray-500 text-sm mt-1">Mulai kelola keuangan Anda dengan FinanceKu</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
            {serverError}
          </div>
        )}

        <FormField label="Nama Lengkap" error={errors.name?.message}>
          <Input type="text" placeholder="John Doe" autoComplete="name" {...register("name")} />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" placeholder="nama@email.com" autoComplete="email" {...register("email")} />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <Input type="password" placeholder="Min. 8 karakter, huruf kapital & angka" autoComplete="new-password" {...register("password")} />
        </FormField>

        <FormField label="Konfirmasi Password" error={errors.confirmPassword?.message}>
          <Input type="password" placeholder="Ulangi password" autoComplete="new-password" {...register("confirmPassword")} />
        </FormField>

        <Button type="submit" loading={isSubmitting} className="w-full">
          <UserPlus className="w-4 h-4" />
          Daftar
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-emerald-600 font-medium hover:underline">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}