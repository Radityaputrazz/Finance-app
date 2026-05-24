import { requireGuest } from "@/lib/auth/session";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  await requireGuest();
  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl shadow-gray-100/50 border border-white">
        {children}
      </div>
    </div>
  );
}